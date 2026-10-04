import { Module } from '@nestjs/common';
import { IpoController } from './ipo.controller';
import { CalendarModule } from '../calendar/calendar.module';
import { CalendarService } from '../calendar/calendar.service';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [StocksModule],
  providers: [CalendarService],
  controllers: [IpoController],
})
export class IpoModule {}
