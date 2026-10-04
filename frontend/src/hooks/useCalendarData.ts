import { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
    CalendarEvent, 
    EarningsEvent, 
    FIIDIIData, 
    RBI_EVENTS_2025, 
    MARKET_HOLIDAYS_2025 
} from '@/lib/calendarData';

interface UseCalendarDataProps {
    year: number;
    month: number;
}

export function useCalendarData({ year, month }: UseCalendarDataProps) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [fiiDii, setFiiDii] = useState<FIIDIIData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const fetchCalendarData = useCallback(async () => {
        if (!mounted.current) return;
        setLoading(true);
        setError(null);

        try {
            const firstDay = startOfMonth(new Date(year, month));
            const lastDay = endOfMonth(firstDay);
            const fromStr = format(firstDay, 'yyyy-MM-dd');
            const toStr = format(lastDay, 'yyyy-MM-dd');

            // 1. Fetch data in parallel
            const [earningsRes, fiiDiiRes, corporateRes] = await Promise.allSettled([
                fetch(`/api/calendar/earnings?from=${fromStr}&to=${toStr}`).then(r => r.json()),
                fetch(`/api/calendar/fii-dii?days=60`).then(r => r.json()),
                fetch(`/api/calendar/corporate?from=${fromStr}&to=${toStr}`).then(r => r.json())
            ]);

            if (!mounted.current) return;

            // 2. Parse responses
            const newEvents: CalendarEvent[] = [];

            // A. Static RBI Events
            RBI_EVENTS_2025.forEach(rbi => {
                newEvents.push({
                    id: `rbi-${rbi.date}-${rbi.type}`,
                    date: rbi.date,
                    title: rbi.title,
                    category: 'rbi',
                    impact: rbi.impact,
                    description: rbi.description
                });
            });

            // B. Static Holidays
            MARKET_HOLIDAYS_2025.forEach(holiday => {
                newEvents.push({
                    id: `holiday-${holiday.date}-${holiday.name}`,
                    date: holiday.date,
                    title: holiday.name,
                    category: 'holiday',
                    impact: 'low',
                    description: `Market closed on account of ${holiday.name}`
                });
            });

            // C. Earnings
            if (earningsRes.status === 'fulfilled' && earningsRes.value?.earningsCalendar) {
                earningsRes.value.earningsCalendar.forEach((e: EarningsEvent) => {
                    newEvents.push({
                        id: `earnings-${e.date}-${e.symbol}`,
                        date: e.date,
                        title: `${e.name} Earnings`,
                        category: 'earnings',
                        impact: 'high',
                        description: `Q${e.quarter} earnings release for ${e.name}`,
                        symbol: e.symbol,
                        meta: {
                            'EPS Est': e.epsEstimate ?? 'N/A',
                            'Rev Est': e.revenueEstimate ?? 'N/A'
                        }
                    });
                });
            }

            // D. FII/DII
            if (fiiDiiRes.status === 'fulfilled' && fiiDiiRes.value?.data) {
                setFiiDii(fiiDiiRes.value.data);
            }

            // E. Corporate Actions
            if (corporateRes.status === 'fulfilled' && corporateRes.value) {
                const { dividends, splits } = corporateRes.value;
                if (dividends) {
                    dividends.forEach((d: any) => {
                        newEvents.push({
                            id: `dividend-${d.date}-${d.symbol}`,
                            date: d.date,
                            title: `${d.name} Dividend`,
                            category: 'dividend',
                            impact: 'medium',
                            description: `Dividend Ex-Date: ${d.amount} ${d.currency}`,
                            symbol: d.symbol,
                            meta: { Amount: `${d.amount} ${d.currency}` }
                        });
                    });
                }
                if (splits) {
                    splits.forEach((s: any) => {
                        newEvents.push({
                            id: `split-${s.date}-${s.symbol}`,
                            date: s.date,
                            title: `${s.symbol.replace('.NS', '')} Stock Split`,
                            category: 'split',
                            impact: 'medium',
                            description: `Stock split in ratio ${s.ratio}`,
                            symbol: s.symbol,
                            meta: { Ratio: s.ratio }
                        });
                    });
                }
            }

            // Deduplicate (though IDs should mostly prevent it, it's good practice)
            const uniqueEvents = Array.from(new Map(newEvents.map(e => [e.id, e])).values());
            
            setEvents(uniqueEvents);

        } catch (err: any) {
            console.error("useCalendarData fetch error:", err);
            if (mounted.current) setError(err.message || 'Failed to load calendar data');
        } finally {
            if (mounted.current) setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    return { events, fiiDii, loading, error, refetch: fetchCalendarData };
}
