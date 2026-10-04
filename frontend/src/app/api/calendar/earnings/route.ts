import { NextRequest } from 'next/server';
import { TRACKED_STOCKS, EarningsEvent } from '@/lib/calendarData';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        
        if (!from || !to) {
            return Response.json({ earningsCalendar: [] }, { status: 400 });
        }

        const apiKey = process.env.FINNHUB_API_KEY;
        if (!apiKey) {
            console.error("Missing FINNHUB_API_KEY");
            return Response.json({ earningsCalendar: [] });
        }

        const response = await fetch(`https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${apiKey}`, {
            next: { revalidate: 3600 } // Not strictly necessary since we use headers below, but good practice
        });

        if (!response.ok) {
            throw new Error(`Finnhub returned ${response.status}`);
        }

        const data = await response.json();
        const rawEarnings = data.earningsCalendar || [];

        const nseTrackedSymbols = new Set(TRACKED_STOCKS.map(s => s.symbol));

        const filteredEarnings: EarningsEvent[] = [];

        for (const item of rawEarnings) {
            // Finnhub often returns .NS or .BO for Indian stocks. Sometimes just the symbol.
            let isTracked = false;
            let symbolWithoutSuffix = item.symbol;
            
            if (item.symbol.endsWith('.NS')) {
                symbolWithoutSuffix = item.symbol.replace('.NS', '');
            } else if (item.symbol.endsWith('.BO')) {
                symbolWithoutSuffix = item.symbol.replace('.BO', '');
            }

            if (item.symbol.endsWith('.NS') || nseTrackedSymbols.has(symbolWithoutSuffix)) {
                isTracked = true;
            }

            if (isTracked) {
                filteredEarnings.push({
                    date: item.date,
                    symbol: symbolWithoutSuffix + '.NS',
                    name: TRACKED_STOCKS.find(s => s.symbol === symbolWithoutSuffix)?.name || symbolWithoutSuffix,
                    exchange: 'NSE',
                    epsEstimate: item.epsEstimate,
                    revenueEstimate: item.revenueEstimate,
                    quarter: `Q${item.quarter} FY${item.year}`
                });
            }
        }

        return new Response(JSON.stringify({ earningsCalendar: filteredEarnings }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
            }
        });

    } catch (error) {
        console.error("Earnings API Error:", error);
        return new Response(JSON.stringify({ earningsCalendar: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
