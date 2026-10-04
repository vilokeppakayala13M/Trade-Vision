import { NextRequest, NextResponse } from 'next/server';
import { requirePaperTradingAuth } from '@/lib/paperTradingAuth';
import dbConnect from '@/lib/db';
import PaperAccount from '@/models/PaperAccount';
import PaperPosition from '@/models/PaperPosition';
import { fetchStockQuotes } from '@/lib/api';

export async function GET(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;

    try {
        await dbConnect();
        
        let account = await PaperAccount.findOne({ userId });
        if (!account) {
            account = await PaperAccount.create({
                userId,
                balance: 1000000,
                startingBalance: 1000000,
                currency: 'INR'
            });
        }

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

        let positionsValue = 0;
        positions.forEach((pos: any) => {
            const quote = quotes.find(q => q.symbol === pos.symbol);
            const price = quote?.c || pos.avgEntryPrice;
            positionsValue += pos.quantity * price;
        });

        const equity = account.balance + positionsValue;

        return NextResponse.json({
            _id: account._id,
            userId: account.userId,
            balance: account.balance,
            startingBalance: account.startingBalance,
            currency: account.currency || 'INR',
            positionsValue,
            equity,
            updatedAt: account.updatedAt
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return GET(req);
}
