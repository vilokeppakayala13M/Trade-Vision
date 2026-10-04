import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FinnhubService } from './finnhub.service';
import { MarketStatusService } from './market-status.service';
import { StockQuote, CompanyProfile, ChartData, MarketStatus } from '../../common/types';

@Injectable()
export class StocksService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private finnhubService: FinnhubService,
    private marketStatusService: MarketStatusService,
  ) {}

  async getQuote(symbol: string): Promise<StockQuote> {
    const s = symbol.toUpperCase();
    const cacheKey = `stock:quote:${s}`;
    let quote = await this.cacheManager.get<StockQuote>(cacheKey);
    
    if (!quote) {
      const data = await this.finnhubService.getQuote(s);
      quote = {
        symbol: s,
        displaySymbol: s,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        volume: data.v || 0,
        timestamp: data.t,
      };
      await this.cacheManager.set(cacheKey, quote, 60);
    }
    return quote;
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
    const results: StockQuote[] = [];
    const uncached: string[] = [];

    for (const sym of uniqueSymbols) {
      const cached = await this.cacheManager.get<StockQuote>(`stock:quote:${sym}`);
      if (cached) {
        results.push(cached);
      } else {
        uncached.push(sym);
      }
    }

    if (uncached.length > 0) {
      // Chunking into 50s
      for (let i = 0; i < uncached.length; i += 50) {
        const chunk = uncached.slice(i, i + 50);
        const data = await this.finnhubService.getQuotes(chunk);
        
        for (const item of data) {
          const q: StockQuote = {
            symbol: item.symbol,
            displaySymbol: item.symbol,
            price: item.c,
            change: item.d,
            changePercent: item.dp,
            high: item.h,
            low: item.l,
            open: item.o,
            previousClose: item.pc,
            volume: item.v || 0,
            timestamp: item.t,
          };
          results.push(q);
          await this.cacheManager.set(`stock:quote:${item.symbol}`, q, 60);
        }
      }
    }

    return results;
  }

  async getProfile(symbol: string): Promise<CompanyProfile> {
    const s = symbol.toUpperCase();
    const cacheKey = `stock:profile:${s}`;
    let profile = await this.cacheManager.get<CompanyProfile>(cacheKey);
    
    if (!profile) {
      const data = await this.finnhubService.getCompanyProfile(s);
      profile = {
        symbol: s,
        name: data.name || s,
        exchange: data.exchange || 'NSE',
        sector: data.finnhubIndustry || 'Other',
        industry: data.finnhubIndustry || 'Other',
        description: '', // Finnhub free doesn't give much desc
        logo: data.logo || '',
        website: data.weburl || '',
        employees: data.employeeTotal || 0,
        country: data.country || 'IN',
        currency: data.currency || 'INR',
      };
      await this.cacheManager.set(cacheKey, profile, 3600);
    }
    return profile;
  }

  async getChart(symbol: string, resolution: string, from: number, to: number): Promise<ChartData> {
    const s = symbol.toUpperCase();
    const cacheKey = `stock:chart:${s}:${resolution}:${from}:${to}`;
    let chart = await this.cacheManager.get<ChartData>(cacheKey);
    
    if (!chart) {
      const data = await this.finnhubService.getCandles(s, resolution, from, to);
      if (data.s === 'no_data') {
        chart = { timestamps: [], opens: [], highs: [], lows: [], closes: [], volumes: [] };
      } else {
        chart = {
          timestamps: data.t || [],
          opens: data.o || [],
          highs: data.h || [],
          lows: data.l || [],
          closes: data.c || [],
          volumes: data.v || [],
        };
      }
      
      const ttl = resolution === 'D' || resolution === 'W' || resolution === 'M' ? 86400 : 300;
      await this.cacheManager.set(cacheKey, chart, ttl);
    }
    return chart;
  }

  async search(query: string): Promise<any[]> {
    // Dummy local search for now, could integrate with Finnhub search endpoint
    return [{ symbol: query.toUpperCase(), description: `${query.toUpperCase()} description` }];
  }

  getMarketStatus(): MarketStatus {
    return this.marketStatusService.getStatus();
  }

  async getTopMovers(): Promise<{ gainers: StockQuote[], losers: StockQuote[] }> {
    // In a real app, query top 100 constituents. For now, empty arrays as placeholders.
    return { gainers: [], losers: [] };
  }

  async getSectorPerformance(): Promise<any[]> {
    return [];
  }

  async getNewsBySymbol(symbol: string): Promise<any[]> {
    const cacheKey = `stock:news:${symbol}`;
    let news = await this.cacheManager.get<any[]>(cacheKey);
    if (!news) {
      news = await this.finnhubService.getNews(symbol);
      await this.cacheManager.set(cacheKey, news, 300);
    }
    return news;
  }

  async getLatestNews(category: string): Promise<any[]> {
    const cacheKey = `news:latest:${category}`;
    let news = await this.cacheManager.get<any[]>(cacheKey);
    if (!news) {
      news = await this.finnhubService.getNews(undefined, category);
      await this.cacheManager.set(cacheKey, news, 300);
    }
    return news;
  }
}
