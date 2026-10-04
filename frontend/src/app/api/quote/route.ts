import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        // Yahoo Finance Chart API
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo API responded with ${response.status}`);
        }

        const data = await response.json();
        const result = data.chart.result?.[0];

        if (!result) {
            throw new Error('No data found');
        }

        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose;
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;

        return NextResponse.json({
            c: price,
            d: change,
            dp: changePercent,
            h: meta.regularMarketDayHigh,
            l: meta.regularMarketDayLow,
            o: meta.regularMarketOpen,
            pc: prevClose
        });

    } catch (error) {
        console.error('Error fetching from Yahoo:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
