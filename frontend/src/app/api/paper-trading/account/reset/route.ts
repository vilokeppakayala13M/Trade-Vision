import { NextRequest, NextResponse } from 'next/server';
import { requirePaperTradingAuth } from '@/lib/paperTradingAuth';
import dbConnect from '@/lib/db';
import PaperAccount from '@/models/PaperAccount';
import PaperPosition from '@/models/PaperPosition';
import AccountLedger from '@/models/AccountLedger';

export async function POST(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;

    try {
        await dbConnect();
        
        await PaperPosition.deleteMany({ userId });

        const account = await PaperAccount.findOneAndUpdate(
            { userId },
            { balance: 1000000, startingBalance: 1000000, lastResetAt: new Date() },
            { upsert: true, new: true }
        );

        await AccountLedger.create({
            userId,
            type: 'reset',
            amount: 1000000,
            balanceAfter: 1000000,
            description: 'Account reset to starting balance'
        });

        return NextResponse.json({
            success: true,
            message: 'Paper trading account reset successfully',
            account
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
