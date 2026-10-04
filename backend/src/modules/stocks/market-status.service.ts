import { Injectable } from '@nestjs/common';
import { toZonedTime } from 'date-fns-tz';
import { addDays, isWeekend, format, setHours, setMinutes, setSeconds, isBefore, isAfter } from 'date-fns';
import { MarketStatus } from '../../common/types';

// Hardcoded holidays for 2025 as per requirement
const MARKET_HOLIDAYS_2025 = [
  '2025-01-26', '2025-02-26', '2025-03-14', '2025-04-14', '2025-04-18',
  '2025-05-01', '2025-07-06', '2025-08-15', '2025-08-27', '2025-10-02',
  '2025-10-20', '2025-10-21', '2025-11-05', '2025-12-25'
];

@Injectable()
export class MarketStatusService {
  private readonly timezone = 'Asia/Kolkata';

  getStatus(): MarketStatus {
    const nowUtc = new Date();
    const nowIst = toZonedTime(nowUtc, this.timezone);

    const isHoliday = MARKET_HOLIDAYS_2025.includes(format(nowIst, 'yyyy-MM-dd'));
    const isWknd = isWeekend(nowIst);

    const marketOpen = setSeconds(setMinutes(setHours(nowIst, 9), 15), 0);
    const marketClose = setSeconds(setMinutes(setHours(nowIst, 15), 30), 0);
    const preOpen = setSeconds(setMinutes(setHours(nowIst, 9), 0), 0);

    let session: 'PRE_OPEN' | 'OPEN' | 'CLOSED' | 'HOLIDAY' = 'CLOSED';
    let isOpen = false;

    if (isHoliday) {
      session = 'HOLIDAY';
    } else if (isWknd) {
      session = 'CLOSED';
    } else if (isAfter(nowIst, preOpen) && isBefore(nowIst, marketOpen)) {
      session = 'PRE_OPEN';
    } else if (isAfter(nowIst, marketOpen) && isBefore(nowIst, marketClose)) {
      session = 'OPEN';
      isOpen = true;
    }

    return {
      isOpen,
      session,
      nextOpenDate: this.getNextOpenTime().toISOString(),
    };
  }

  isMarketOpen(): boolean {
    return this.getStatus().isOpen;
  }

  getNextOpenTime(): Date {
    let checkDate = new Date();
    let checkIst = toZonedTime(checkDate, this.timezone);
    
    // If we are past 9:15 AM today, move to tomorrow
    if (isAfter(checkIst, setMinutes(setHours(checkIst, 9), 15))) {
      checkIst = addDays(checkIst, 1);
    }

    while (
      isWeekend(checkIst) || 
      MARKET_HOLIDAYS_2025.includes(format(checkIst, 'yyyy-MM-dd'))
    ) {
      checkIst = addDays(checkIst, 1);
    }

    return setSeconds(setMinutes(setHours(checkIst, 9), 15), 0);
  }
}

