import { NextRequest, NextResponse } from 'next/server';
import { requirePaperTradingAuth } from '@/lib/paperTradingAuth';
import dbConnect from '@/lib/db';
import PaperPosition from '@/models/PaperPosition';
import { fetchStockQuotes } from '@/lib/api';

export async function GET(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;

    try {
        await dbConnect();
        
        const positions = await PaperPosition.find({ userId, quantity: { $gt: 0 } });
        const symbols = positions.map((p: any) => p.symbol);
        
        let quotes: any[] = [];
        if (symbols.length > 0) {
            try {
                quotes = await fetchStockQuotes(symbols);
            } catch (e) {
                // Ignore quote error fallback
            }
        }

        const data = positions.map((pos: any) => {
            const quote = quotes.find(q => q.symbol === pos.symbol);
            const currentPrice = quote?.c || pos.avgEntryPrice;
            const currentValue = pos.quantity * currentPrice;
            const totalCost = pos.quantity * pos.avgEntryPrice;
            const unrealizedPnL = currentValue - totalCost;
            const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

            return {
                _id: pos._id.toString(),
                userId: pos.userId.toString(),
                symbol: pos.symbol,
                displaySymbol: pos.displaySymbol || pos.symbol,
                companyName: pos.companyName || pos.symbol,
                side: pos.side || 'long',
                quantity: pos.quantity,
                avgEntryPrice: pos.avgEntryPrice,
                totalInvested: pos.totalInvested,
                currentPrice,
                currentValue,
                unrealizedPnL,
                unrealizedPnLPercent
            };
        });

        return NextResponse.json({ data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
