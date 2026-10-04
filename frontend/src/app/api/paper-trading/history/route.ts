import { NextRequest, NextResponse } from 'next/server';
import { requirePaperTradingAuth } from '@/lib/paperTradingAuth';
import PaperTrade from '@/models/PaperTrade';

export async function GET(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;
    
    try {
        const url = new URL(req.url);
        let page = parseInt(url.searchParams.get('page') || '1');
        let limit = parseInt(url.searchParams.get('limit') || '20');
        const symbol = url.searchParams.get('symbol');
        const action = url.searchParams.get('action');
        const fromDate = url.searchParams.get('from');
        const toDate = url.searchParams.get('to');

        if (page < 1) page = 1;
        if (limit < 1) limit = 20;
        if (limit > 100) limit = 100;

        const filter: any = { userId };
        
        if (symbol) {
            const escapedSymbol = symbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            filter.displaySymbol = new RegExp(`^${escapedSymbol}$`, 'i');
        }
        
        if (action && (action === 'BUY' || action === 'SELL')) {
            filter.action = action;
        }

        if (fromDate || toDate) {
            filter.executedAt = {};
            if (fromDate) filter.executedAt.$gte = new Date(fromDate);
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                filter.executedAt.$lte = end;
            }
        }

        const skip = (page - 1) * limit;

        const trades = await PaperTrade.find(filter)
            .sort({ executedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await PaperTrade.countDocuments(filter);

        // Aggregation for summary
        const summaryPipeline = [
            { $match: filter },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                    totalBrokerage: { $sum: '$brokerage' },
                    totalRealizedPnL: { $sum: '$realizedPnL' }
                }
            }
        ];

        const summaryData = await PaperTrade.aggregate(summaryPipeline);
        
        let totalTrades = 0;
        let totalBuys = 0;
        let totalSells = 0;
        let totalBrokerage = 0;
        let realizedPnL = 0;

        summaryData.forEach(item => {
            totalTrades += item.count;
            totalBrokerage += item.totalBrokerage;
            if (item._id === 'BUY') {
                totalBuys = item.count;
            } else if (item._id === 'SELL') {
                totalSells = item.count;
                realizedPnL = item.totalRealizedPnL;
            }
        });

        return NextResponse.json({
            trades,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            summary: {
                totalTrades,
                totalBuys,
                totalSells,
                totalBrokerage,
                realizedPnL
            }
        });

    } catch (error: any) {
        console.error('History GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch trade history' }, { status: 500 });
    }
}
