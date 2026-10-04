import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requirePaperTradingAuth, getOrCreatePortfolio } from '@/lib/paperTradingAuth';
import { fetchStockQuote } from '@/lib/api';
import PaperTrade from '@/models/PaperTrade';
import { TRACKED_STOCKS } from '@/lib/calendarData';
import { toClientError, AppError } from '@/lib/errors';

export async function POST(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;

    try {
        const body = await req.json();
        let { symbol, action, quantity, notes } = body;

        // Validation
        if (!symbol || typeof symbol !== 'string') {
            return NextResponse.json({ error: 'Valid symbol is required' }, { status: 400 });
        }
        
        symbol = symbol.toUpperCase();
        if (!symbol.endsWith('.NS')) {
            symbol += '.NS';
        }
        const displaySymbol = symbol.replace('.NS', '');

        const trackedSymbols = new Set(TRACKED_STOCKS.map(s => s.symbol));
        if (!trackedSymbols.has(displaySymbol)) {
            return NextResponse.json({ error: 'This stock is not available for paper trading.' }, { status: 400 });
        }

        if (action !== 'BUY' && action !== 'SELL') {
            return NextResponse.json({ error: 'Action must be BUY or SELL' }, { status: 400 });
        }

        quantity = Math.floor(Number(quantity));
        if (isNaN(quantity) || quantity < 1 || quantity > 10000) {
            return NextResponse.json({ error: 'Quantity must be between 1 and 10000' }, { status: 400 });
        }

        if (notes && notes.length > 500) {
            return NextResponse.json({ error: 'Notes cannot exceed 500 characters' }, { status: 400 });
        }

        // Fetch live price
        const quote = await fetchStockQuote(symbol);
        if (!quote || !quote.c || quote.c === 0) {
            return NextResponse.json({ error: 'Unable to fetch live price for this stock. Markets may be closed.' }, { status: 503 });
        }
        
        const price = quote.c;
        const companyName = TRACKED_STOCKS.find(s => s.symbol === displaySymbol)?.name || displaySymbol;
        const brokerage = 20;

        // Transaction handling
        const session = await mongoose.startSession();
        let savedTrade = null;
        let updatedPortfolioData = null;

        await session.withTransaction(async () => {
            const portfolio = await getOrCreatePortfolio(userId);
            const holdingIndex = portfolio.holdings.findIndex((h: any) => h.symbol === symbol);
            const existingHolding = holdingIndex !== -1 ? portfolio.holdings[holdingIndex] : null;

            const cashBalanceBefore = portfolio.cashBalance;
            let cashBalanceAfter = cashBalanceBefore;
            const holdingQuantityBefore = existingHolding ? existingHolding.quantity : 0;
            let holdingQuantityAfter = holdingQuantityBefore;
            let avgBuyPriceAfter = existingHolding ? existingHolding.avgBuyPrice : 0;
            let realizedPnL = 0;
            let realizedPnLPercent = undefined;
            
            const totalValue = price * quantity;
            let netValue = 0;

            if (action === 'BUY') {
                const totalCost = totalValue + brokerage;
                netValue = totalCost;
                
                if (portfolio.cashBalance < totalCost) {
                    throw new Error(`Insufficient funds. You need ₹${totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })} but only have ₹${portfolio.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`);
                }

                cashBalanceAfter -= totalCost;
                holdingQuantityAfter += quantity;
                
                if (existingHolding) {
                    const prevTotalInvested = existingHolding.quantity * existingHolding.avgBuyPrice;
                    const newTotalInvested = prevTotalInvested + totalValue; // Total invested does not include brokerage per standard averaging, or you can include it. Let's strictly use price * qty for avg.
                    avgBuyPriceAfter = newTotalInvested / holdingQuantityAfter;
                    
                    existingHolding.quantity = holdingQuantityAfter;
                    existingHolding.avgBuyPrice = avgBuyPriceAfter;
                    existingHolding.totalInvested = holdingQuantityAfter * avgBuyPriceAfter;
                    existingHolding.lastBuyDate = new Date();
                } else {
                    avgBuyPriceAfter = price;
                    portfolio.holdings.push({
                        symbol,
                        displaySymbol,
                        companyName,
                        quantity,
                        avgBuyPrice: price,
                        totalInvested: totalValue,
                        firstBuyDate: new Date(),
                        lastBuyDate: new Date()
                    });
                }
            } else if (action === 'SELL') {
                if (!existingHolding) {
                    throw new Error(`You do not hold any shares of ${displaySymbol}.`);
                }
                if (quantity > existingHolding.quantity) {
                    throw new Error(`You only hold ${existingHolding.quantity} shares of ${displaySymbol}.`);
                }

                const proceeds = totalValue - brokerage;
                netValue = proceeds;
                cashBalanceAfter += proceeds;
                holdingQuantityAfter -= quantity;

                realizedPnL = ((price - existingHolding.avgBuyPrice) * quantity) - brokerage;
                realizedPnLPercent = ((price - existingHolding.avgBuyPrice) / existingHolding.avgBuyPrice) * 100;
                
                if (holdingQuantityAfter === 0) {
                    portfolio.holdings.splice(holdingIndex, 1);
                } else {
                    existingHolding.quantity = holdingQuantityAfter;
                    existingHolding.totalInvested = holdingQuantityAfter * existingHolding.avgBuyPrice;
                    // avgBuyPrice remains unchanged on sell
                }
            }

            portfolio.cashBalance = cashBalanceAfter;
            await portfolio.save({ session });

            const trade = new PaperTrade({
                userId,
                symbol,
                displaySymbol,
                companyName,
                action,
                quantity,
                price,
                totalValue,
                brokerage,
                netValue,
                cashBalanceBefore,
                cashBalanceAfter,
                holdingQuantityBefore,
                holdingQuantityAfter,
                avgBuyPriceAfter,
                realizedPnL,
                realizedPnLPercent,
                notes,
                executedAt: new Date(),
                marketStatus: 'OPEN' // Could be derived from time, simplified to OPEN here
            });

            const saved = await trade.save({ session });
            savedTrade = saved;
            
            // Re-calc total holdings value for response
            let totalHoldingsValue = 0;
            for (const h of portfolio.holdings) {
                 // Roughly estimating using current price for instant response, or just return cashBalance
                 // Let's just return cashBalance and basic total. The UI will re-fetch full portfolio anyway.
            }
            
            updatedPortfolioData = {
                cashBalance: portfolio.cashBalance
            };
        });

        session.endSession();

        return NextResponse.json({ 
            success: true, 
            trade: savedTrade, 
            updatedPortfolio: updatedPortfolioData 
        });

    } catch (error: any) {
        // Handle specific operational errors we threw inside the transaction
        if (error.message && (error.message.includes('Insufficient') || error.message.includes('do not hold') || error.message.includes('only hold'))) {
            const clientErr = toClientError(new AppError(error.message, 400));
            return NextResponse.json({ error: clientErr.error }, { status: clientErr.statusCode });
        }
        
        const clientErr = toClientError(error);
        return NextResponse.json({ error: clientErr.error }, { status: clientErr.statusCode });
    }
}
