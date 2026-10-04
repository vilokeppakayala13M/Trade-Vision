import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { fetchStockQuote, fetchCompanyProfile } from '@/lib/api';
import { analyzeSentiment } from '@/lib/analysis/sentiment';
import { makeDecision } from '@/lib/analysis/decision';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { toClientError, AppError } from '@/lib/errors';

// Initialize without explicit apiKey so it uses process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const rateLimitResult = await rateLimit(`chat_${ip}`, 20, 60 * 60 * 1000); // 20 requests per hour

        if (!rateLimitResult.success) {
            return createRateLimitResponse(rateLimitResult.reset);
        }

        const body = await req.json();
        const { message, symbol, stockContext, history = [] } = body;

        let systemPrompt = `You are TradeVision AI, a knowledgeable assistant for the TradeVision platform, specializing in the Indian stock market, mutual funds (SIP), portfolio strategy, and market trends.
IMPORTANT DISCLAMER: You are not SEBI-registered. All your responses are for educational purposes only. You must always mention risk when discussing buy/sell decisions.
Current Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST).
Refuse to answer any questions completely unrelated to the Indian stock market, personal finance, or the TradeVision app.
Answer in concise, plain English. Do not use markdown headers or bolding excessively. Do not use bullet points unless you are listing specific steps.
End every response with this exact line in italics: "_Not SEBI-registered advice. For educational purposes only._"`;

        if (symbol) {
            let nseSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
            const [quote, profile] = await Promise.all([
                fetchStockQuote(nseSymbol),
                fetchCompanyProfile(nseSymbol)
            ]);

            let analysisText = "";
            
            if (quote && quote.c) {
                let sentimentPolarity = stockContext?.sentiment || 0;
                let decision = stockContext?.verdict || "Hold";
                let decisionReason = "";

                if (stockContext?.newsHeadlines) {
                    const headlinesStr = Array.isArray(stockContext.newsHeadlines) ? stockContext.newsHeadlines.join(' ') : stockContext.newsHeadlines;
                    const sentimentResult = analyzeSentiment(headlinesStr);
                    sentimentPolarity = sentimentResult.polarity;
                    
                    const decisionResult = makeDecision({
                        currentPrice: quote.c,
                        predictedPrice: quote.c * 1.05,
                        polarity: sentimentPolarity,
                        globalPolarity: 0,
                        hasHoldings: false
                    });
                    decision = decisionResult.decision;
                    decisionReason = decisionResult.reason;
                }

                analysisText = `
Live Data for ${profile?.name || symbol} (${nseSymbol}):
- Current Price: ₹${quote.c}
- Day Change: ${quote.dp.toFixed(2)}%
- 52-Week High: ₹${quote.h}
- 52-Week Low: ₹${quote.l}
- Sentiment Polarity: ${sentimentPolarity.toFixed(2)} (-1 to 1)
- Algo Decision: ${decision} (${decisionReason})
`;
            } else if (stockContext) {
                 analysisText = `
Live Data Context:
- Price: ₹${stockContext.price}
- Day Change: ${stockContext.changePercent}%
- Sentiment Polarity: ${stockContext.sentiment}
- Algo Decision: ${stockContext.verdict}
`;
            }
            
            if (analysisText) {
                systemPrompt += `\n\nThe user is currently looking at the following live stock data. Use this data when answering questions about this stock:\n${analysisText}`;
            }
        }

        // Map Anthropic-style history to Gemini format
        const contents = history.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemPrompt,
                maxOutputTokens: 600,
            }
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of stream) {
                        if (chunk.text) {
                            controller.enqueue(encoder.encode(chunk.text));
                        }
                    }
                } catch (err) {
                    console.error('Stream error', err);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'X-Content-Type-Options': 'nosniff'
            }
        });

    } catch (error: any) {
        // Handle generic errors (Gemini SDK throws standard Error with message, often containing status info)
        if (error?.message?.includes('401') || error?.message?.includes('403') || error?.message?.includes('API key')) {
            const clientErr = toClientError(new AppError('Authentication Error: Invalid or missing GEMINI_API_KEY in .env.local', 401));
            return Response.json({ error: clientErr.error }, { status: clientErr.statusCode });
        }
        if (error?.message?.includes('429') || error?.message?.includes('Quota')) {
            const clientErr = toClientError(new AppError('Rate Limit / Quota Exceeded: Check your Gemini billing details.', 429));
            return Response.json({ error: clientErr.error }, { status: clientErr.statusCode });
        }

        const clientErr = toClientError(error);
        return Response.json({ error: clientErr.error }, { status: clientErr.statusCode });
    }
}
