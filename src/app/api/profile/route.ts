import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile,price`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch from upstream' }, { status: response.status });
        }

        const data = await response.json();
        const result = data.quoteSummary?.result?.[0];

        if (!result) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const profile = result.assetProfile;
        const price = result.price;

        return NextResponse.json({
            name: price?.shortName || price?.longName || symbol,
            ticker: symbol,
            logo: '',
            weburl: profile?.website || '',
            finnhubIndustry: profile?.industry || '',
            currency: price?.currency || 'INR'
        });
    } catch (error) {
        console.error('Profile proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
