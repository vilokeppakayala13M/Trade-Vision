import { NextResponse } from 'next/server';

// Function to fetch quotes given an array of symbols using the Chart API
async function fetchQuotes(symbols: string[]) {
    try {
        const promises = symbols.map(async (symbol) => {
            try {
                const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                if (!response.ok) {
                    return null;
                }

                const data = await response.json();
                const result = data.chart?.result?.[0];

                if (!result) return null;

                const meta = result.meta;
                const price = meta.regularMarketPrice;
                const prevClose = meta.chartPreviousClose || meta.previousClose;
                const change = price - prevClose;
                const changePercent = (change / prevClose) * 100;

                return {
                    symbol: symbol,
                    c: price,
                    d: change,
                    dp: changePercent,
                    h: meta.regularMarketDayHigh,
                    l: meta.regularMarketDayLow,
                    o: meta.regularMarketOpen,
                    pc: prevClose
                };
            } catch (err) {
                console.error(`Error fetching chart data for ${symbol}:`, err);
                return null;
            }
        });

        const results = await Promise.all(promises);
        const formattedResults = results.filter(Boolean); // Remove nulls

        console.log(`[BatchAPI] Fetched ${formattedResults.length}/${symbols.length} symbols using Chart API`);

        return NextResponse.json(formattedResults, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
            },
        });
    } catch (error: unknown) {
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
