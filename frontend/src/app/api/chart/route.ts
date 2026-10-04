import { NextRequest, NextResponse } from 'next/server';

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            if ((response.status === 429 || response.status === 403) && attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            return response;
        } catch (err) {
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
    throw new Error('Failed to fetch after retries');
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    let symbol = searchParams.get('symbol');
    const range = searchParams.get('range') || '1d'; // 1d, 5d, 1mo, 3mo, 1y
    const interval = searchParams.get('interval') || '5m'; // 1m, 5m, 15m, 1h, 1d

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const fetchYahooChart = async (targetSymbol: string) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${targetSymbol}?range=${range}&interval=${interval}`;
        const response = await fetchWithRetry(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo Finance API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.chart?.error) {
            throw new Error(data.chart.error.description || 'Chart data error');
        }

        const result = data.chart?.result?.[0];
        if (!result) {
            throw new Error('No chart data available');
        }

        return result;
    };

    try {
        let result;
        const isOnlyLowercase = /^[a-z]+$/.test(symbol);

        if (isOnlyLowercase) {
            try {
                result = await fetchYahooChart(symbol);
            } catch {
                symbol = symbol.toUpperCase() + '.NS';
                result = await fetchYahooChart(symbol);
            }
        } else {
            result = await fetchYahooChart(symbol);
        }

        const timestamps = result.timestamp || [];
        const quote = result.indicators?.quote?.[0];

        if (!quote) {
            throw new Error('No quote data in chart');
        }

        // Format chart data
        const chartData = timestamps.map((timestamp: number, index: number) => {
            const priceVal = quote.close?.[index] ?? quote.open?.[index];
            return {
                time: new Date(timestamp * 1000).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    month: 'short',
                    day: 'numeric',
                    hour: interval.includes('m') || interval.includes('h') ? '2-digit' : undefined,
                    minute: interval.includes('m') ? '2-digit' : undefined
                }),
                timestamp,
                price: priceVal != null ? priceVal : null,
                open: quote.open?.[index],
                high: quote.high?.[index],
                low: quote.low?.[index],
                close: quote.close?.[index],
                volume: quote.volume?.[index]
            };
        }).filter((d: { price: number | null }) => d.price != null && !isNaN(d.price));

        return NextResponse.json({
            symbol,
            range,
            interval,
            data: chartData,
            meta: result.meta
        });

    } catch (error) {
        console.error('Chart API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch chart data' },
            { status: 500 }
        );
    }
}
