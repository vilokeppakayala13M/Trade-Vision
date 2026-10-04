import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StocksService } from '../stocks/stocks.service';
import { Public } from '../../common/decorators/current-user.decorator';

@ApiTags('News')
@Public()
@Controller('news')
export class NewsController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  @ApiOperation({ summary: 'Get latest market news' })
  @ApiQuery({ name: 'category', required: false, example: 'general' })
  getLatestNews(@Query('category') category: string = 'general') {
    return this.stocksService.getLatestNews(category);
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Get news for a specific symbol' })
  @ApiParam({ name: 'symbol', required: true })
  getNewsBySymbol(@Param('symbol') symbol: string) {
    return this.stocksService.getNewsBySymbol(symbol);
  }
}
