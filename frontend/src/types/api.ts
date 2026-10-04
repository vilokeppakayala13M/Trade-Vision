import { EnrichedPortfolio, TradeRecord, AnalyticsData } from './paperTrading';

// --- Stock / Market Data Types ---

export interface StockQuote {
    c: number;     // Current price
    d: number;     // Change
    dp: number;    // Percent change
    h: number;     // High price of the day
    l: number;     // Low price of the day
    o: number;     // Open price of the day
    pc: number;    // Previous close price
    symbol?: string; // Stock symbol
}

export interface CompanyProfile {
    name: string;
    ticker: string;
    logo: string;
    weburl: string;
    finnhubIndustry: string;
    currency: string;
}

export interface ChartDataPoint {
    time: string;
    timestamp: number;
    price: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
}

export interface ChartResponse {
    symbol: string;
    range: string;
    interval: string;
    data: ChartDataPoint[];
    meta: any;
}

export interface MarketNews {
    category?: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

export interface SearchResult {
    symbol: string;
    shortname: string;
    exchange?: string;
    typeDisp?: string;
}

export type Decision = 'BUY' | 'SELL' | 'HOLD' | 'WAIT' | 'DONT_BUY';

export interface MarketFeature {
    symbol: string;
    price: number;
    volume: number;
    open: number;
    high: number;
    low: number;
    close: number;
    sentiment: {
        score: number;
        polarity: number;
        subjectivity: number;
        positive: number;
        negative: number;
        neutral: number;
    };
    verdict: Decision;
    verdictReason: string;
}

export interface IPOItem {
    id: string;
    company: string;
    symbol: string;
    category: 'Mainboard' | 'SME';
    date: string;
    subscription: string;
    biddingDates: string;
    priceRange: string;
    issueSize: string;
    status: string;
}

export interface IPOResponse {
    open: IPOItem[];
    closed: IPOItem[];
    listed: IPOItem[];
    upcoming: IPOItem[];
}

// --- Auth API Request / Response Types ---

export interface CSRFResponse {
    csrfToken: string;
}

export interface UserResponseData {
    _id: string;
    name: string;
    email: string;
    accessToken?: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
    googleId?: string;
    emailVerified?: boolean;
}

export interface AuthResponse {
    success: boolean;
    data?: UserResponseData;
    error?: string;
    message?: string;
    needsVerification?: boolean;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface RegisterRequest {
    email: string;
    name: string;
    password?: string;
    phone?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    email: string;
    password?: string;
}

export interface ResendVerificationRequest {
    email: string;
}

// --- Calendar API Types ---

export interface FIIDIIData {
    date: string;
    fiiNet: number;
    diiNet: number;
    fiiGross: number;
    diiGross: number;
}

export interface FII_DIIPaginatedResponse {
    data: FIIDIIData[];
    lastUpdated: string;
}

export interface EarningsEvent {
    date: string;
    symbol: string;
    name: string;
    exchange: string;
    epsEstimate: number | null;
    revenueEstimate: number | null;
    quarter: string;
}

export interface EarningsResponse {
    earningsCalendar: EarningsEvent[];
}

export interface DividendEvent {
    symbol: string;
    name: string;
    date: string;
    amount: number;
    currency: string;
}

export interface SplitEvent {
    symbol: string;
    date: string;
    fromFactor: number;
    toFactor: number;
    ratio: string;
}

export interface CorporateActionsResponse {
    dividends: DividendEvent[];
    splits: SplitEvent[];
}

// --- Paper Trading Request / Response Types ---

export interface PaperTradingPortfolioResponse {
    portfolio: EnrichedPortfolio;
}

export interface ResetPortfolioRequest {
    action: 'RESET';
    confirm: boolean;
}

export interface SubmitTradeRequest {
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    notes?: string;
}

export interface SubmitTradeResponse {
    success: boolean;
    trade?: TradeRecord;
    error?: string;
}

export interface TradeHistoryResponse {
    trades: TradeRecord[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    summary: {
        totalTrades: number;
        totalBuys: number;
        totalSells: number;
        totalBrokerage: number;
        realizedPnL: number;
    };
}

export interface LeaderboardUser {
    userId: string;
    username: string;
    portfolioValue: number;
    totalReturnPercent: number;
    rank: number;
    isCurrentUser?: boolean;
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardUser[];
}

// --- Contact request ---
export interface ContactRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface ContactResponse {
    message: string;
}

// --- Chat Panel requests ---
export interface ChatSuggestionsResponse {
    suggestions: string[];
}

export interface ChatRequest {
    message: string;
    symbol?: string;
    stockContext?: any;
    history?: { role: 'user' | 'assistant'; content: string }[];
}
