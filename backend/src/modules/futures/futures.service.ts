import { Injectable } from '@nestjs/common';
import { StocksService } from '../stocks/stocks.service';

@Injectable()
export class FuturesService {
  constructor(private stocksService: StocksService) {}

  async getActiveContracts(symbol: string) {
    const quote = await this.stocksService.getQuote(symbol);
    const basePrice = quote.price;
    const now = new Date();
    
    // Simulate F&O data based on cash market for the assignment since Finnhub Free doesn't have NSE F&O
    const currentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0];
    const farMonth = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().split('T')[0];

    return [
      {
        contractId: `${symbol}-${currentMonth}`,
        symbol,
        expiry: currentMonth,
        type: 'FUT',
        price: +(basePrice * 1.002).toFixed(2),
        change: quote.change,
        changePercent: quote.changePercent,
        openInterest: 1500000,
        volume: 250000,
      },
      {
        contractId: `${symbol}-${nextMonth}`,
        symbol,
        expiry: nextMonth,
        type: 'FUT',
        price: +(basePrice * 1.005).toFixed(2),
        change: quote.change,
        changePercent: quote.changePercent,
        openInterest: 500000,
        volume: 50000,
      },
      {
        contractId: `${symbol}-${farMonth}`,
        symbol,
        expiry: farMonth,
        type: 'FUT',
        price: +(basePrice * 1.008).toFixed(2),
        change: quote.change,
        changePercent: quote.changePercent,
        openInterest: 100000,
        volume: 10000,
      }
    ];
  }
}
