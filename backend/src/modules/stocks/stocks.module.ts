import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StocksService } from './stocks.service';
import { FinnhubService } from './finnhub.service';
import { MarketStatusService } from './market-status.service';
import { StocksController } from './stocks.controller';

@Module({
  imports: [HttpModule],
  providers: [StocksService, FinnhubService, MarketStatusService],
  controllers: [StocksController],
  exports: [StocksService, MarketStatusService, FinnhubService],
})
export class StocksModule {}
