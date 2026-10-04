import { getStockSymbol } from './api';
import { fetchCompanyTweets } from './twitter';
import { analyzeBatch } from './analysis/sentiment';
import { makeDecision, Decision } from './analysis/decision';
import { calculateTrend } from './analysis/prediction';

export interface MarketFeature {
    symbol: string;
    price: number;
    volume: number;
    open: number;
    high: number;
    low: number;
    close: number;
    sentiment: {
        score: number;
        polarity: number;
        subjectivity: number;
        positive: number;
        negative: number;
        neutral: number;
    };
    verdict: Decision;
    verdictReason: string;
}

// Robust direct fetcher using Yahoo Chart API (same as api/quotes/route.ts)
async function fetchYahooDataDirect(symbol: string) {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 30 }
        });

        if (!response.ok) {
            console.error(`Yahoo direct fetch failed: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];

        if (!result) return null;

        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose;

        // Extract price history for prediction
        const quotes = result.indicators.quote[0];
        const prices = quotes.close.filter((p: number | null) => p !== null) as number[];

        return {
            symbol: meta.symbol,
            price: currentPrice,
            prevClose: prevClose,
            open: meta.regularMarketOpen,
            high: meta.regularMarketDayHigh,
            low: meta.regularMarketDayLow,
            volume: meta.regularMarketVolume,
            currency: meta.currency,
            prices: prices
        };
    } catch (e) {
        console.error('Yahoo Direct Fetch Error:', e);
        return null;
    }
}

/**
 * Aggregates data from multiple sources to build a features dataset
 * as per the Data Acquisition flow.
 */
export async function buildFeaturesDataset(id: string): Promise<MarketFeature | null> {
    try {
        const symbol = getStockSymbol(id);

        // 1. Fetch Real-Time Data (Direct Chart API)
        const marketData = await fetchYahooDataDirect(symbol);

        if (!marketData) {
            console.error(`No market data found for ${symbol} via Direct Fetch`);
            return null;
        }

        // 2. Fetch Tweets (Simulated Web Scraper)
        const tweets = await fetchCompanyTweets(symbol, 50);
        const tweetTexts = tweets.map(t => t.text);

        // 3. NLP & Sentiment Analysis
        const sentiment = analyzeBatch(tweetTexts);

        // 4. Algorithmic Verdict
        let predictedPrice = marketData.price;

        if (marketData.prices.length > 0) {
            // Linear Regression on recent history
            const trend = calculateTrend(marketData.prices, 7);
            if (trend.forecast.length > 0) {
                // Use the price 7 days out
                predictedPrice = trend.forecast[trend.forecast.length - 1].y;
            }
        }

        const decisionResult = makeDecision({
            currentPrice: marketData.price,
            predictedPrice: predictedPrice,
            polarity: sentiment.polarity,
            globalPolarity: 0.1, // Benchmark
            hasHoldings: false
        });

        // 5. Construct Final Dataset
        return {
            symbol: marketData.symbol || symbol,
            price: marketData.price,
            volume: marketData.volume,
            open: marketData.open,
            high: marketData.high,
            low: marketData.low,
            close: marketData.prevClose,
            sentiment: {
                score: sentiment.score,
                polarity: sentiment.polarity,
                subjectivity: sentiment.subjectivity,
                positive: sentiment.positive,
                negative: sentiment.negative,
                neutral: sentiment.neutral
            },
            verdict: decisionResult.decision,
            verdictReason: decisionResult.reason
        };

    } catch (error) {
        console.error('Error building features dataset:', error);
        return null;
    }
}
