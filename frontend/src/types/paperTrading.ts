export interface EnrichedHolding {
    symbol: string;
    displaySymbol: string;
    companyName: string;
    quantity: number;
    avgBuyPrice: number;
    totalInvested: number;
    firstBuyDate: string | Date;
    lastBuyDate: string | Date;
    
    // Enriched fields from live quote
    currentPrice: number;
    currentValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    dayChange: number;
    dayChangePercent: number;
}

export interface EnrichedPortfolio {
    _id: string;
    userId: string;
    cashBalance: number;
    startingBalance: number;
    totalDeposited: number;
    holdings: EnrichedHolding[];
    createdAt: string;
    updatedAt: string;
    lastResetAt?: string;

    // Enriched fields
    totalHoldingsValue: number;
    totalPortfolioValue: number;
    totalInvestedValue: number;
    totalUnrealizedPnL: number;
    totalReturnPercent: number;
    dayPnL: number;
}

export interface TradeRecord {
    _id: string;
    userId: string;
    tradeId: string;
    symbol: string;
    displaySymbol: string;
    companyName: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    totalValue: number;
    brokerage: number;
    netValue: number;
    cashBalanceBefore: number;
    cashBalanceAfter: number;
    holdingQuantityBefore: number;
    holdingQuantityAfter: number;
    avgBuyPriceAfter: number;
    realizedPnL: number;
    realizedPnLPercent?: number;
    notes?: string;
    executedAt: string | Date;
    marketStatus: 'OPEN' | 'CLOSED' | 'PRE_OPEN';
}

export interface PortfolioStats {
    totalPortfolioValue: number;
    totalHoldingsValue: number;
    cashBalance: number;
    totalInvestedValue: number;
    totalUnrealizedPnL: number;
    totalReturnPercent: number;
    dayPnL: number;
    winRate: number;
    tradeCount: number;
}

export interface AnalyticsData {
    winRate: number;
    bestTrade: { symbol: string, returnPercent: number } | null;
    worstTrade: { symbol: string, returnPercent: number } | null;
    mostTraded: { symbol: string, count: number }[];
    monthlyPnL: { month: string, pnl: number }[];
    sectorPerformance: { sector: string, pnl: number }[];
    avgHoldDuration: { symbol: string, days: number }[];
    insufficient?: boolean;
    message?: string;
}
