import { Module } from '@nestjs/common';
import { FuturesService } from './futures.service';
import { FuturesController } from './futures.controller';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [StocksModule],
  providers: [FuturesService],
  controllers: [FuturesController],
})
export class FuturesModule {}
