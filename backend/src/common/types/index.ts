export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  tier: 'free' | 'pro';
  iat: number;
  exp: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorDetail;
  meta?: ResponseMeta;
}

export interface ErrorDetail {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  requestId: string;
  fields?: { field: string; message: string }[];
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

export interface StockQuote {
  symbol: string;
  displaySymbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  timestamp: number;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  description: string;
  logo: string;
  website: string;
  employees: number;
  country: string;
  currency: string;
}

export interface ChartData {
  timestamps: number[];
  opens: number[];
  highs: number[];
  lows: number[];
  closes: number[];
  volumes: number[];
}

export interface MarketStatus {
  isOpen: boolean;
  session: 'PRE_OPEN' | 'OPEN' | 'CLOSED' | 'HOLIDAY';
  opensAt?: string;
  closesAt?: string;
  nextOpenDate?: string;
}
