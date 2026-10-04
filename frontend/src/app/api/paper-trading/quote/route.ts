import { NextRequest, NextResponse } from 'next/server';
import { fetchStockQuote } from '@/lib/api';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitRes = await rateLimit(`quote_${ip}`, 60, 60 * 1000);
    if (!limitRes.success) {
        return createRateLimitResponse(limitRes.reset);
    }

    try {
        const url = new URL(req.url);
        let symbol = url.searchParams.get('symbol');

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        symbol = symbol.toUpperCase();
        if (!symbol.endsWith('.NS')) {
            symbol += '.NS';
        }

        const quote = await fetchStockQuote(symbol);

        const responseHeaders = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };

        if (!quote || quote.c === undefined || quote.c === 0) {
            return NextResponse.json({ 
                error: 'Price unavailable', 
                price: 0 
            }, { status: 200, headers: responseHeaders });
        }

        return NextResponse.json({
            symbol,
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            previousClose: quote.pc,
            timestamp: Date.now()
        }, { headers: responseHeaders });

    } catch (error: any) {
        console.error('Quote GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch quote', price: 0 }, { status: 200 });
    }
}
