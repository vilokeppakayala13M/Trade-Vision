import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

const yf = new yahooFinance();

// @ts-expect-error suppressNotices is not present in default typings
if (typeof yf.suppressNotices === 'function') {
    // @ts-expect-error suppressNotices is not present in default typings
    yf.suppressNotices(['yahooSurvey']);
}

interface YFQuote {
    symbol: string;
    regularMarketPrice?: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketOpen?: number;
    regularMarketPreviousClose?: number;
    [key: string]: unknown;
}

// Function to fetch quotes given an array of symbols
async function fetchQuotes(symbols: string[]) {
    try {
        const results = await yf.quote(symbols) as YFQuote[];

        const formattedResults = results.map((quote: YFQuote) => ({
            symbol: quote.symbol,
            c: quote.regularMarketPrice,
            d: quote.regularMarketChange,
            dp: quote.regularMarketChangePercent,
            h: quote.regularMarketDayHigh,
            l: quote.regularMarketDayLow,
            o: quote.regularMarketOpen,
            pc: quote.regularMarketPreviousClose
        }));

        console.log(`[BatchAPI] Fetched ${formattedResults.length}/${symbols.length} symbols`);

        return NextResponse.json(formattedResults, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
            },
        });
    } catch (error: unknown) {
        // Check for rate limiting
        const err = error as { message?: string, status?: number };
        if (err.message?.includes('429') || err.status === 429 || err.message?.includes('Too Many Requests')) {
            console.warn('Yahoo Finance Rate Limit (429)');
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        console.error('Error fetching batch quotes:', error);
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
        return NextResponse.json({ error: 'Symbols are required' }, { status: 400 });
    }

    const symbols = symbolsParam.split(',');
    return fetchQuotes(symbols);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const symbols = body.symbols;
        
        if (!symbols || !Array.isArray(symbols)) {
            return NextResponse.json({ error: 'Symbols array is required in request body' }, { status: 400 });
        }
        
        return fetchQuotes(symbols);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
}
