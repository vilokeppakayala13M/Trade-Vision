import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo API responded with ${response.status}`);
        }

        const data = await response.json();

        // Map results to a simpler format
        const suggestions = (data.quotes || []).map((quote: { symbol: string, shortname?: string, longname?: string, exchange?: string, typeDisp?: string }) => ({
            symbol: quote.symbol,
            shortname: quote.shortname || quote.longname || quote.symbol,
            exchange: quote.exchange,
            typeDisp: quote.typeDisp
        }));

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to search for stocks' },
            { status: 500 }
        );
    }
}
