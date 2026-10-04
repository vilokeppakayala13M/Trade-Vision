import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [StocksModule],
  controllers: [NewsController],
})
export class NewsModule {}
