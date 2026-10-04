export enum FinnhubPath {
  QUOTE = '/quote',
  SEARCH = '/search',
  COMPANY_PROFILE2 = '/stock/profile2',
  STOCK_CANDLES = '/stock/candle',
  MARKET_STATUS = '/stock/market-status',
  COMPANY_NEWS = '/company-news',
  NEWS = '/news',
  EARNINGS_CALENDAR = '/calendar/earnings',
  IPO_CALENDAR = '/calendar/ipo',
}

export function buildFinnhubUrl(path: FinnhubPath, queryParams: Record<string, string | number>): string {
  const baseUrl = 'https://finnhub.io/api/v1';
  const url = new URL(`${baseUrl}${path}`);
  
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  }
  
  // Enforce HTTPS
  if (url.protocol !== 'https:') {
    throw new Error('URL must use HTTPS protocol');
  }

  // Enforce hostname
  if (url.hostname !== 'finnhub.io') {
    throw new Error('SSRF Protection: Invalid hostname');
  }

  return url.toString();
}
