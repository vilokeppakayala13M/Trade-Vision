import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { buildFinnhubUrl, FinnhubPath } from '../../common/utils/url-builder.util';

@Injectable()
export class FinnhubService {
  private readonly logger = new Logger(FinnhubService.name);
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('finnhub.apiKey') || '';
  }

  private async request<T>(path: FinnhubPath, params: Record<string, any> = {}, retries = 3): Promise<T> {
    params.token = this.apiKey;
    
    // Use the strict URL builder which prevents SSRF via hostname and protocol checks
    const url = buildFinnhubUrl(path, params);

    for (let i = 0; i < retries; i++) {
      try {
        const response = await firstValueFrom(
          this.httpService.get<T>(url).pipe(
            catchError((error) => {
              if (error.response?.status === 429) {
                return throwError(() => new Error('RATE_LIMIT'));
              }
              return throwError(() => error);
            })
          )
        );
        return response.data;
      } catch (error: any) {
        if (error.message === 'RATE_LIMIT' && i < retries - 1) {
          const delay = Math.pow(2, i) * 1000;
          this.logger.warn(`Rate limited by Finnhub. Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }
        this.logger.error(`Finnhub API error on ${path}: ${error.message}`);
        throw new ServiceUnavailableException('Market data provider unavailable');
      }
    }
    throw new ServiceUnavailableException('Market data provider unavailable');
  }

  async getQuote(symbol: string): Promise<any> {
    return this.request(FinnhubPath.QUOTE, { symbol });
  }

  async getQuotes(symbols: string[]): Promise<any[]> {
    const promises = symbols.map(s => this.getQuote(s).then(q => ({ symbol: s, ...q })).catch(() => null));
    const results = await Promise.all(promises);
    return results.filter(r => r !== null);
  }

  async getCompanyProfile(symbol: string): Promise<any> {
    return this.request(FinnhubPath.COMPANY_PROFILE2, { symbol });
  }

  async getNews(symbol?: string, category: string = 'general'): Promise<any[]> {
    if (symbol) {
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const to = new Date().toISOString().split('T')[0];
      return this.request(FinnhubPath.COMPANY_NEWS, { symbol, from, to });
    }
    return this.request(FinnhubPath.NEWS, { category });
  }

  async getEarningsCalendar(from: string, to: string): Promise<any[]> {
    return this.request(FinnhubPath.EARNINGS_CALENDAR, { from, to }).then((res: any) => res.earningsCalendar || []);
  }

  async getIPOs(from: string, to: string): Promise<any[]> {
    return this.request(FinnhubPath.IPO_CALENDAR, { from, to }).then((res: any) => res.ipoCalendar || []);
  }

  async getCandles(symbol: string, resolution: string, from: number, to: number): Promise<any> {
    return this.request(FinnhubPath.STOCK_CANDLES, { symbol, resolution, from, to });
  }
}
