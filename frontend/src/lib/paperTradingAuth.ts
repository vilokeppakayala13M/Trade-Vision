import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from './db';
import PaperPortfolio from '@/models/PaperPortfolio';

export async function requirePaperTradingAuth(request: NextRequest): Promise<{ userId: string, userName: string } | NextResponse> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authentication required to use paper trading' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (!token) {
        return NextResponse.json({ error: 'Authentication required to use paper trading' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, name: string };
        if (!decoded.userId) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
        }
        return { userId: decoded.userId, userName: decoded.name };
    } catch (error) {
        return NextResponse.json({ error: 'Authentication required to use paper trading' }, { status: 401 });
    }
}

export async function getOrCreatePortfolio(userId: string) {
    await dbConnect();
    
    let portfolio = await PaperPortfolio.findOne({ userId });
    
    if (!portfolio) {
        portfolio = new PaperPortfolio({
            userId,
            cashBalance: 1000000,
            startingBalance: 1000000,
            totalDeposited: 1000000,
            holdings: []
        });
        await portfolio.save();
    }
    
    return portfolio;
}
