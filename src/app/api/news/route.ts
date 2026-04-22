import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export async function GET() {
    if (!API_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(`${BASE_URL}/news?category=general&token=${API_KEY}`, {
            next: { revalidate: 1800 } // Cache for 30 minutes
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch news' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('News fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
