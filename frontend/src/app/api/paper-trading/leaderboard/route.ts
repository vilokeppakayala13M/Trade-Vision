import { NextRequest, NextResponse } from 'next/server';
import { requirePaperTradingAuth, getOrCreatePortfolio } from '@/lib/paperTradingAuth';
import PaperLeaderboard from '@/models/PaperLeaderboard';
import PaperTrade from '@/models/PaperTrade';

export async function GET(req: NextRequest) {
    try {
        const leaderboard = await PaperLeaderboard.find()
            .sort({ totalReturn: -1 })
            .limit(20)
            .lean();

        // If the user provides auth header, try to get their rank, otherwise return null
        let userRank = null;
        
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const authResult = await requirePaperTradingAuth(req);
            if (!(authResult instanceof NextResponse)) {
                const { userId } = authResult;
                const userEntry = await PaperLeaderboard.findOne({ userId });
                if (userEntry) {
                    const countAhead = await PaperLeaderboard.countDocuments({
                        totalReturn: { $gt: userEntry.totalReturn }
                    });
                    userRank = countAhead + 1;
                }
            }
        }

        return NextResponse.json({ leaderboard, userRank });

    } catch (error: any) {
        console.error('Leaderboard GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId, userName } = authResult;

    try {
        // Compute stats for leaderboard
        const portfolio = await getOrCreatePortfolio(userId);
        
        // This is a simplified total value calc without re-fetching all live quotes
        // just using the invested value to save API hits on this background route
        // Wait, the prompt says "it fetches their portfolio, computes all stats". 
        // Let's actually hit the portfolio GET logic, but we can reuse the fetch quotes approach.
        // For performance, we could abstract the portfolio calculation, but let's just do it here.
        
        // Fetch quotes
        const symbols = portfolio.holdings.map((h: any) => h.symbol);
        
        // Dynamically importing fetchStockQuotes here to avoid circular dep if any, though it's safe.
        const { fetchStockQuotes } = await import('@/lib/api');
        
        let quotes: any[] = [];
        if (symbols.length > 0) {
            quotes = await fetchStockQuotes(symbols);
        }

        let totalHoldingsValue = 0;
        portfolio.holdings.forEach((holding: any) => {
            const quote = quotes.find(q => q.symbol === holding.symbol || q.symbol === holding.symbol.replace('.NS', ''));
            const currentPrice = quote?.c || holding.avgBuyPrice;
            totalHoldingsValue += currentPrice * holding.quantity;
        });

        const currentPortfolioValue = portfolio.cashBalance + totalHoldingsValue;
        const totalReturnAbsolute = currentPortfolioValue - portfolio.startingBalance;
        const totalReturn = (totalReturnAbsolute / portfolio.startingBalance) * 100;

        // Trade stats
        const tradeCount = await PaperTrade.countDocuments({ userId });
        
        let winRate = 0;
        let bestTradeData = { symbol: '', returnPercent: 0 };
        
        if (tradeCount > 0) {
            const sellTradesData = await PaperTrade.aggregate([
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
            ]);

            if (sellTradesData.length > 0 && sellTradesData[0].totalSells > 0) {
                winRate = (sellTradesData[0].profitableSells / sellTradesData[0].totalSells) * 100;
            }

            const best = await PaperTrade.findOne({ userId, action: 'SELL' })
                .sort({ realizedPnLPercent: -1 })
                .select('displaySymbol realizedPnLPercent')
                .lean();

            if (best && best.realizedPnLPercent) {
                bestTradeData = {
                    symbol: best.displaySymbol,
                    returnPercent: best.realizedPnLPercent
                };
            }
        }

        // Format displayName for privacy: First name + Last initial + '.'
        // E.g. "Rahul Sharma" -> "Rahul S."
        const nameParts = userName.trim().split(/\s+/);
        let displayName = nameParts[0];
        if (nameParts.length > 1) {
            displayName += ` ${nameParts[nameParts.length - 1].charAt(0)}.`;
        }

        const updateData = {
            displayName,
            totalReturn,
            totalReturnAbsolute,
            currentPortfolioValue,
            tradeCount,
            winRate,
            bestTrade: bestTradeData,
            lastUpdated: new Date()
        };

        await PaperLeaderboard.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Leaderboard POST Error:', error);
        return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 });
    }
}
