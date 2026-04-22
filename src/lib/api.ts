export interface StockQuote {
    c: number; // Current price
    d: number; // Change
    dp: number; // Percent change
    h: number; // High price of the day
    l: number; // Low price of the day
    o: number; // Open price of the day
    pc: number; // Previous close price
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

/**
 * Fetches the latest quote for a given stock symbol.
 * Uses local proxy to fetch from Yahoo Finance for NSE/BSE support.
 * @param symbol The stock symbol (e.g., 'RELIANCE.NS')
 */
export const fetchStockQuote = async (symbol: string): Promise<StockQuote | null> => {
    try {
        // Use local proxy to avoid CORS and rate limits
        // This singular call uses the Chart API internally which often has different rate limits
        const response = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);

        if (response.status === 429) {
            console.warn(`[API] Rate limited (429) for individual symbol: ${symbol}`);
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch quote for ${symbol}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.warn(`Error fetching stock quote for ${symbol}:`, error);
        return null;
    }
};

/**
 * Fetches quotes for multiple stock symbols in one request.
 * @param symbols Array of stock symbols
 */
/**
 * Fetches quotes for multiple stock symbols in one request.
 * @param symbols Array of stock symbols
 */
export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symbols })
            });

            if (!response.ok) {
                // If rate limited, throw to trigger retry
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded (429)');
                }
                const errorText = await response.text();
                console.error(`Failed to fetch quotes: ${response.status} ${response.statusText}`, errorText);
                return [];
            }

            return await response.json();
        } catch (error) {
            attempt++;
            console.warn(`Attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
                console.warn('Max retries reached for stock quotes (silently failing to prevent UI overlay)');
                return [];
            }
            // Exponential backoff: 1000ms, 2000ms, 4000ms, 8000ms, 16000ms
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
    }
    return [];
};

/**
 * Fetches company profile data.
 * @param symbol The stock symbol
 */
export const fetchCompanyProfile = async (symbol: string): Promise<CompanyProfile | null> => {
    try {
        const response = await fetch(`/api/profile?symbol=${encodeURIComponent(symbol)}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.warn('Error fetching company profile:', error);
        return null;
    }
};

/**
 * Helper to resolve stock symbols for Yahoo Finance.
 * - If symbol has no suffix (e.g. 'ITC'), defaults to NSE ('.NS')
 * - If symbol has suffix (e.g. 'ITC.BO'), preserves it
 */
export const getStockSymbol = (id: string): string => {
    // Known mappings for IDs to Symbols
    const idMap: Record<string, string> = {
        'reliance': 'RELIANCE',
        'tcs': 'TCS',
        'hdfcbank': 'HDFCBANK',
        'infy': 'INFY',
        'icicibank': 'ICICIBANK',
        'tatamotors': 'TATAMOTORS',
        'bhartiairtel': 'BHARTIARTL',
        'sbin': 'SBIN',
        'lici': 'LICI',
        'bajajfinsv': 'BAJFINANCE',
        'hindunilvr': 'HINDUNILVR',
        'lt': 'LT',
        'itc': 'ITC',
        'maruti': 'MARUTI',
        'mm': 'M&M',
        'hcltech': 'HCLTECH',
        'sunpharma': 'SUNPHARMA',
        'kotakbank': 'KOTAKBANK',
        'axisbank': 'AXISBANK',
        'titan': 'TITAN',
        'ultracemco': 'ULTRACEMCO',
        'bajajfinserv': 'BAJAJFINSV',
        'adaniports': 'ADANIPORTS',
        'ntpc': 'NTPC',
        'adanient': 'ADANIENT',
        'ongc': 'ONGC',
        'nestleind': 'NESTLEIND',
        'powergrid': 'POWERGRID',
        'sbilife': 'SBILIFE',
        'britannia': 'BRITANNIA',
        'drreddy': 'DRREDDY',
        'coalindia': 'COALINDIA',
        'bajajauto': 'BAJAJ-AUTO',
        'cipla': 'CIPLA',
        'asianpaint': 'ASIANPAINT',
        'tatasteel': 'TATASTEEL',
        'jswsteel': 'JSWSTEEL',
        'grasim': 'GRASIM',
        'indusindbk': 'INDUSINDBK',
        'eichermot': 'EICHERMOT',
        'shreecem': 'SHREECEM',
        'wipro': 'WIPRO',
        'divislab': 'DIVISLAB',
        'hindalco': 'HINDALCO',
        'hdfclife': 'HDFCLIFE',
        'dabur': 'DABUR',
        'sbicard': 'SBICARD',
        'icicipruli': 'ICICIPRULI',
        'dmart': 'DMART',
        'gail': 'GAIL'
    };

    // Get the base symbol from map or use ID as is
    const symbol = idMap[id.toLowerCase()] || id.toUpperCase();

    // If symbol already has a suffix (e.g. .NS, .BO), use it as is
    if (symbol.includes('.')) {
        return symbol;
    }

    // Default to NSE (.NS) if no suffix
    return `${symbol}.NS`;
};

/**
 * Fetches historical chart data for a stock
 * @param symbol Stock symbol (e.g., 'RELIANCE.NS')
 * @param range Time range ('1d', '5d', '1mo', '3mo', '1y')
 * @param interval Data interval ('1m', '5m', '15m', '1h', '1d')
 */
export const fetchChartData = async (
    symbol: string,
    range: string = '1d',
    interval: string = '5m'
): Promise<unknown> => {
    try {
        const response = await fetch(`/api/chart?symbol=${symbol}&range=${range}&interval=${interval}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch chart data for ${symbol}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching chart data:', error);
        return null;
    }
};

export interface MarketNews {
    id?: string;
    headline?: string;
    summary?: string;
    url?: string;
    source?: string;
    datetime?: number;
    image?: string;
    related?: string;
    [key: string]: unknown;
}

/**
 * Fetches general market news.
 */
export const fetchMarketNews = async (): Promise<MarketNews[]> => {
    try {
        const response = await fetch('/api/news');
        if (!response.ok) throw new Error('Failed to fetch news');
        return await response.json();
    } catch (error) {
        console.error('Error fetching market news:', error);
        return [];
    }
};
export interface SearchResult {
    symbol: string;
    shortname?: string;
    exchange?: string;
    typeDisp?: string;
    [key: string]: unknown;
}

/**
 * Searches for stock symbols based on a query string.
 * @param query The search query
 */
export const searchStocks = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error('Error searching stocks:', error);
        return [];
    }
};
