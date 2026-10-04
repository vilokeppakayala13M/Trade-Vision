import { NextRequest, NextResponse } from 'next/server';
import { requirePaperTradingAuth } from '@/lib/paperTradingAuth';
import PaperTrade from '@/models/PaperTrade';
import { TRACKED_STOCKS } from '@/lib/calendarData';

export async function GET(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;
    
    try {
        // Count sell trades first to ensure sufficient data
        const sellTradesCount = await PaperTrade.countDocuments({ userId, action: 'SELL' });
        
        if (sellTradesCount < 5) {
            return NextResponse.json({ 
                insufficient: true, 
                message: `Complete at least ${5 - sellTradesCount} more sell trade(s) to unlock full analytics.` 
            });
        }

        const [
            winRateData,
            bestTradeData,
            worstTradeData,
            mostTradedData,
            monthlyPnLData,
            tradeDatesData
        ] = await Promise.all([
            // 1. Win rate
            PaperTrade.aggregate([
                { $match: { userId, action: 'SELL' } },
                {
                    $group: {
                        _id: null,
                        totalSells: { $sum: 1 },
                        profitableSells: {
                            $sum: { $cond: [{ $gt: ['$realizedPnL', 0] }, 1, 0] }
                        }
                    }
                }
            ]),

            // 2. Best Trade
            PaperTrade.findOne({ userId, action: 'SELL' })
                .sort({ realizedPnLPercent: -1 })
                .select('displaySymbol realizedPnLPercent')
                .lean(),

            // 3. Worst Trade
            PaperTrade.findOne({ userId, action: 'SELL' })
                .sort({ realizedPnLPercent: 1 })
                .select('displaySymbol realizedPnLPercent')
                .lean(),

            // 4. Most Traded
            PaperTrade.aggregate([
                { $match: { userId } },
                { $group: { _id: '$displaySymbol', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),

            // 5. Monthly PnL
            PaperTrade.aggregate([
                { $match: { userId, action: 'SELL' } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$executedAt' },
                            month: { $month: '$executedAt' }
                        },
                        pnl: { $sum: '$realizedPnL' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),

            // 6. Average hold duration proxy
            PaperTrade.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: '$displaySymbol',
                        minDate: { $min: '$executedAt' },
                        maxDate: { $max: '$executedAt' }
                    }
                }
            ])
        ]);

        const winRate = winRateData.length > 0 
            ? (winRateData[0].profitableSells / winRateData[0].totalSells) * 100 
            : 0;

        const bestTrade = bestTradeData ? {
            symbol: bestTradeData.displaySymbol,
            returnPercent: bestTradeData.realizedPnLPercent || 0
        } : null;

        const worstTrade = worstTradeData ? {
            symbol: worstTradeData.displaySymbol,
            returnPercent: worstTradeData.realizedPnLPercent || 0
        } : null;

        const mostTraded = mostTradedData.map((d: any) => ({
            symbol: d._id,
            count: d.count
        }));

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyPnL = monthlyPnLData.map((d: any) => ({
            month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
            pnl: d.pnl
        }));

        // Sector performance mapping in code to avoid complex lookup if sectors change
        // We'll calculate it from trade history directly here
        const sectorPnLMap: Record<string, number> = {};
        
        // Fetch all sell trades to compute sector PnL
        const allSellTrades = await PaperTrade.find({ userId, action: 'SELL' }).select('displaySymbol realizedPnL').lean();
        
        allSellTrades.forEach(trade => {
            const stock = TRACKED_STOCKS.find(s => s.symbol === trade.displaySymbol);
            const sector = stock ? stock.sector : 'Other';
            sectorPnLMap[sector] = (sectorPnLMap[sector] || 0) + trade.realizedPnL;
        });

        const sectorPerformance = Object.entries(sectorPnLMap)
            .map(([sector, pnl]) => ({ sector, pnl }))
            .sort((a, b) => b.pnl - a.pnl);

        const avgHoldDuration = tradeDatesData.map((d: any) => {
            const msDiff = d.maxDate.getTime() - d.minDate.getTime();
            const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
            return { symbol: d._id, days };
        }).filter(d => d.days > 0);

        return NextResponse.json({
            winRate,
            bestTrade,
            worstTrade,
            mostTraded,
            monthlyPnL,
            sectorPerformance,
            avgHoldDuration
        });

    } catch (error: any) {
        console.error('Analytics GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
