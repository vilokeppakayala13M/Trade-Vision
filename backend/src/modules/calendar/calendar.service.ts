import { Injectable } from '@nestjs/common';
import { FinnhubService } from '../stocks/finnhub.service';
import { format, subDays, addDays } from 'date-fns';

@Injectable()
export class CalendarService {
  constructor(private finnhubService: FinnhubService) {}

  async getEarnings(from?: string, to?: string) {
    const fromDate = from || format(new Date(), 'yyyy-MM-dd');
    const toDate = to || format(addDays(new Date(), 30), 'yyyy-MM-dd');
    return this.finnhubService.getEarningsCalendar(fromDate, toDate);
  }

  async getIPOs(from?: string, to?: string) {
    const fromDate = from || format(new Date(), 'yyyy-MM-dd');
    const toDate = to || format(addDays(new Date(), 30), 'yyyy-MM-dd');
    return this.finnhubService.getIPOs(fromDate, toDate);
  }

  async getEconomicEvents(from?: string, to?: string) {
    // Finnhub Economic Calendar endpoint or mock data
    return [
      {
        id: 'evt1',
        title: 'RBI Interest Rate Decision',
        date: '2025-02-06T10:00:00Z',
        country: 'IN',
        importance: 'HIGH',
        actual: null,
        estimate: '6.5%',
        previous: '6.5%'
      }
    ];
  }
}
