import { NextRequest, NextResponse } from 'next/server';
import { requirePaperTradingAuth, getOrCreatePortfolio } from '@/lib/paperTradingAuth';
import { fetchStockQuotes } from '@/lib/api';
import PaperTrade from '@/models/PaperTrade';
import { EnrichedPortfolio, EnrichedHolding } from '@/types/paperTrading';
import { toClientError } from '@/lib/errors';

export async function GET(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;

    try {
        const portfolio = await getOrCreatePortfolio(userId);
        
        const symbols = portfolio.holdings.map((h: any) => h.symbol);
        
        let quotes: any[] = [];
        if (symbols.length > 0) {
            quotes = await fetchStockQuotes(symbols);
        }

        let totalHoldingsValue = 0;
        let totalInvestedValue = 0;
        let dayPnL = 0;

        const enrichedHoldings: EnrichedHolding[] = portfolio.holdings.map((holding: any) => {
            const quote = quotes.find(q => q.symbol === holding.symbol || q.symbol === holding.symbol.replace('.NS', ''));
            const currentPrice = quote?.c || holding.avgBuyPrice; // Fallback to avg price if quote fails
            const dayChange = quote?.d || 0;
            const dayChangePercent = quote?.dp || 0;
            
            const currentValue = currentPrice * holding.quantity;
            const unrealizedPnL = currentValue - holding.totalInvested;
            const unrealizedPnLPercent = holding.totalInvested > 0 ? (unrealizedPnL / holding.totalInvested) * 100 : 0;

            totalHoldingsValue += currentValue;
            totalInvestedValue += holding.totalInvested;
            dayPnL += (dayChange * holding.quantity);

            return {
                symbol: holding.symbol,
                displaySymbol: holding.displaySymbol,
                companyName: holding.companyName,
                quantity: holding.quantity,
                avgBuyPrice: holding.avgBuyPrice,
                totalInvested: holding.totalInvested,
                firstBuyDate: holding.firstBuyDate,
                lastBuyDate: holding.lastBuyDate,
                currentPrice,
                currentValue,
                unrealizedPnL,
                unrealizedPnLPercent,
                dayChange,
                dayChangePercent
            };
        });

        const startingBalance = portfolio.startingBalance || 1000000;
        const totalPortfolioValue = portfolio.cashBalance + totalHoldingsValue;
        const totalUnrealizedPnL = totalPortfolioValue - startingBalance;
        let totalReturnPercent = ((totalPortfolioValue - startingBalance) / startingBalance) * 100;
        if (isNaN(totalReturnPercent)) totalReturnPercent = 0;

        const enrichedPortfolio: EnrichedPortfolio = {
            _id: portfolio._id.toString(),
            userId: portfolio.userId.toString(),
            cashBalance: portfolio.cashBalance,
            startingBalance: portfolio.startingBalance,
            totalDeposited: portfolio.totalDeposited,
            holdings: enrichedHoldings,
            createdAt: portfolio.createdAt.toISOString(),
            updatedAt: portfolio.updatedAt.toISOString(),
            lastResetAt: portfolio.lastResetAt?.toISOString(),
            totalHoldingsValue,
            totalPortfolioValue,
            totalInvestedValue,
            totalUnrealizedPnL,
            totalReturnPercent,
            dayPnL
        };

        return NextResponse.json({ portfolio: enrichedPortfolio });

    } catch (error: any) {
        const clientErr = toClientError(error);
        return NextResponse.json({ error: clientErr.error }, { status: clientErr.statusCode });
    }
}

export async function POST(req: NextRequest) {
    const authResult = await requirePaperTradingAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId } = authResult;

    try {
        const body = await req.json();
        
        if (body.action !== 'RESET' || body.confirm !== true) {
            return NextResponse.json({ error: 'Invalid reset request' }, { status: 400 });
        }

        const portfolio = await getOrCreatePortfolio(userId);
        
        // 24-hour rate limit check
        if (portfolio.lastResetAt) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (portfolio.lastResetAt > twentyFourHoursAgo) {
                return NextResponse.json({ 
                    error: 'Portfolio can only be reset once every 24 hours.',
                    nextResetAvailableAt: new Date(portfolio.lastResetAt.getTime() + 24 * 60 * 60 * 1000)
                }, { status: 429 });
            }
        }

        // Reset logic
        await PaperTrade.deleteMany({ userId });
        
        portfolio.cashBalance = 1000000;
        portfolio.startingBalance = 1000000;
        portfolio.totalDeposited = 1000000;
        portfolio.holdings = [];
        portfolio.lastResetAt = new Date();
        
        await portfolio.save();

        return NextResponse.json({ success: true, message: 'Portfolio has been reset successfully.' });

    } catch (error: any) {
        const clientErr = toClientError(error);
        return NextResponse.json({ error: clientErr.error }, { status: clientErr.statusCode });
    }
}
