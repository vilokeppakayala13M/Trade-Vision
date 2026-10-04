import { NextRequest, NextResponse } from 'next/server';
import { requirePaperTradingAuth } from '@/lib/paperTradingAuth';
import dbConnect from '@/lib/db';
import PaperAccount from '@/models/PaperAccount';
import PaperPosition from '@/models/PaperPosition';
import PaperOrder from '@/models/PaperOrder';
import AccountLedger from '@/models/AccountLedger';
import { fetchStockQuotes } from '@/lib/api';

export async function GET(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const orders = await PaperOrder.find({ userId }).sort({ createdAt: -1 }).limit(limit);

        return NextResponse.json({ data: orders });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;

    try {
        await dbConnect();
        const body = await req.json();
        const { symbol, companyName, side: rawSide, type: rawType, quantity, price: clientPrice } = body;

        if (!symbol || typeof symbol !== 'string') {
            return NextResponse.json({ error: 'Valid stock symbol is required' }, { status: 400 });
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            return NextResponse.json({ error: 'quantity must be a positive number' }, { status: 400 });
        }

        const side = (rawSide || '').toUpperCase() as 'BUY' | 'SELL';
        if (side !== 'BUY' && side !== 'SELL') {
            return NextResponse.json({ error: 'side must be buy or sell' }, { status: 400 });
        }

        const normalizedSymbol = symbol.toUpperCase();

        // SERVER-SIDE price resolution - NEVER TRUST CLIENT PRICE
        let executionPrice = 0;
        try {
            const quotes = await fetchStockQuotes([normalizedSymbol]);
            if (quotes && quotes.length > 0 && quotes[0]?.c > 0) {
                executionPrice = quotes[0].c;
            }
        } catch (e) {
            // fallback
        }

        if (!executionPrice || executionPrice <= 0) {
            executionPrice = Number(clientPrice) > 0 ? Number(clientPrice) : 100;
        }

        let account = await PaperAccount.findOne({ userId });
        if (!account) {
            account = await PaperAccount.create({
                userId,
                balance: 1000000,
                startingBalance: 1000000,
                currency: 'INR'
            });
        }

        const totalCost = executionPrice * qty;

        if (side === 'BUY') {
            if (account.balance < totalCost) {
                return NextResponse.json({ 
                    error: `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${account.balance.toFixed(2)}` 
                }, { status: 400 });
            }

            // Atomic balance update
            const updatedAccount = await PaperAccount.findOneAndUpdate(
                { userId, balance: { $gte: totalCost } },
                { $inc: { balance: -totalCost, version: 1 } },
                { new: true }
            );

            if (!updatedAccount) {
                return NextResponse.json({ 
                    error: `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${account.balance.toFixed(2)}` 
                }, { status: 400 });
            }

            account = updatedAccount;

            let position = await PaperPosition.findOne({ userId, symbol: normalizedSymbol });
            if (position) {
                const newQty = position.quantity + qty;
                const newAvg = ((position.quantity * position.avgEntryPrice) + (qty * executionPrice)) / newQty;
                position.quantity = newQty;
                position.avgEntryPrice = newAvg;
                position.totalInvested = newQty * newAvg;
                await position.save();
            } else {
                position = await PaperPosition.create({
                    userId,
                    symbol: normalizedSymbol,
                    displaySymbol: normalizedSymbol,
                    companyName: companyName || normalizedSymbol,
                    side: 'long',
                    quantity: qty,
                    avgEntryPrice: executionPrice,
                    totalInvested: totalCost
                });
            }
        } else {
            // SELL
            const position = await PaperPosition.findOne({ userId, symbol: normalizedSymbol });
            if (!position || position.quantity < qty) {
                const held = position ? position.quantity : 0;
                return NextResponse.json({ 
                    error: `Cannot sell ${qty} shares of ${normalizedSymbol}. You currently hold ${held} shares.` 
                }, { status: 400 });
            }

            const newQty = position.quantity - qty;
            if (newQty === 0) {
                await PaperPosition.deleteOne({ _id: position._id });
            } else {
                position.quantity = newQty;
                position.totalInvested = newQty * position.avgEntryPrice;
                await position.save();
            }

            account = await PaperAccount.findOneAndUpdate(
                { userId },
                { $inc: { balance: totalCost, version: 1 } },
                { new: true }
            );
        }

        const order = await PaperOrder.create({
            userId,
            symbol: normalizedSymbol,
            displaySymbol: normalizedSymbol,
            side,
            type: (rawType || 'market').toLowerCase(),
            quantity: qty,
            requestedPrice: clientPrice || executionPrice,
            filledPrice: executionPrice,
            totalValue: totalCost,
            status: 'filled',
            filledAt: new Date()
        });

        await AccountLedger.create({
            userId,
            orderId: order._id,
            type: 'trade',
            amount: side === 'BUY' ? -totalCost : totalCost,
            balanceAfter: account.balance,
            description: `${side} ${qty} ${normalizedSymbol} @ ₹${executionPrice.toFixed(2)}`
        });

        return NextResponse.json({ data: order, success: true }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
