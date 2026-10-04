import { NextRequest } from 'next/server';

export interface DividendEvent {
    symbol: string;
    name: string;
    date: string;
    amount: number;
    currency: string;
}

export interface SplitEvent {
    symbol: string;
    date: string;
    fromFactor: number;
    toFactor: number;
    ratio: string;
}

const TOP_20_STOCKS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 
    'SBIN', 'LT', 'ITC', 'HINDUNILVR', 'TATAMOTORS', 
    'AXISBANK', 'KOTAKBANK', 'SUNPHARMA', 'WIPRO', 'TITAN', 
    'MARUTI', 'BAJFINANCE', 'NTPC', 'POWERGRID', 'ADANIPORTS'
];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        
        if (!from || !to) {
            return Response.json({ dividends: [], splits: [] }, { status: 400 });
        }

        const apiKey = process.env.FINNHUB_API_KEY;
        if (!apiKey) {
            console.error("Missing FINNHUB_API_KEY");
            return Response.json({ dividends: [], splits: [] });
        }

        const dividendPromises = TOP_20_STOCKS.map(symbol => 
            fetch(`https://finnhub.io/api/v1/stock/dividend2?symbol=${symbol}.NS&from=${from}&to=${to}&token=${apiKey}`)
                .then(r => r.ok ? r.json() : null)
        );

        const splitPromises = TOP_20_STOCKS.map(symbol => 
            fetch(`https://finnhub.io/api/v1/stock/split?symbol=${symbol}.NS&from=${from}&to=${to}&token=${apiKey}`)
                .then(r => r.ok ? r.json() : null)
        );

        const [dividendResults, splitResults] = await Promise.all([
            Promise.allSettled(dividendPromises),
            Promise.allSettled(splitPromises)
        ]);

        const dividends: DividendEvent[] = [];
        const splits: SplitEvent[] = [];
        
        const divSet = new Set<string>();
        const splitSet = new Set<string>();

        dividendResults.forEach((result, idx) => {
            if (result.status === 'fulfilled' && result.value && result.value.data) {
                const symbol = TOP_20_STOCKS[idx];
                result.value.data.forEach((d: any) => {
                    const key = `${symbol}-${d.date}`;
                    if (!divSet.has(key)) {
                        divSet.add(key);
                        dividends.push({
                            symbol: symbol + '.NS',
                            name: symbol,
                            date: d.date,
                            amount: d.amount,
                            currency: d.currency || 'INR'
                        });
                    }
                });
            }
        });

        splitResults.forEach((result, idx) => {
            if (result.status === 'fulfilled' && result.value && Array.isArray(result.value)) {
                const symbol = TOP_20_STOCKS[idx];
                result.value.forEach((s: any) => {
                    const key = `${symbol}-${s.date}`;
                    if (!splitSet.has(key)) {
                        splitSet.add(key);
                        splits.push({
                            symbol: symbol + '.NS',
                            date: s.date,
                            fromFactor: s.fromFactor,
                            toFactor: s.toFactor,
                            ratio: `${s.toFactor}:${s.fromFactor}`
                        });
                    }
                });
            }
        });

        return new Response(JSON.stringify({ dividends, splits }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=86400'
            }
        });

    } catch (error) {
        console.error("Corporate API Error:", error);
        return new Response(JSON.stringify({ dividends: [], splits: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
