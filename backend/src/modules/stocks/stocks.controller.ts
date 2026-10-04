import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { CustomCacheInterceptor, CacheKey, CacheTTL } from '../../common/interceptors/cache.interceptor';
import { Public } from '../../common/decorators/current-user.decorator';

@ApiTags('Stocks')
@Public()
@UseInterceptors(CustomCacheInterceptor)
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated stock list' })
  @ApiQuery({ name: 'sector', required: false })
  @ApiQuery({ name: 'capType', required: false })
  @ApiQuery({ name: 'minChange', required: false })
  @ApiQuery({ name: 'maxChange', required: false })
  @CacheKey('stocks:list')
  @CacheTTL(60)
  async getStocks() {
    return []; // Implementation requires a DB of all 100 constituents
  }

  @Get('movers')
  @ApiOperation({ summary: 'Get top gainers and losers' })
  @CacheKey('stocks:movers')
  @CacheTTL(60)
  async getMovers() {
    return this.stocksService.getTopMovers();
  }

  @Get('sector-performance')
  @ApiOperation({ summary: 'Get sector performance' })
  @CacheKey('stocks:sectors')
  @CacheTTL(300)
  async getSectorPerformance() {
    return this.stocksService.getSectorPerformance();
  }

  @Get('market-status')
  @ApiOperation({ summary: 'Get current NSE market status' })
  @CacheKey('stocks:market-status')
  @CacheTTL(30)
  getMarketStatus() {
    return this.stocksService.getMarketStatus();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for a stock' })
  @ApiQuery({ name: 'q', required: true })
  @CacheKey('stocks:search')
  @CacheTTL(300)
  async search(@Query('q') q: string) {
    if (!q) return [];
    return this.stocksService.search(q);
  }

  @Get(':symbol/quote')
  @ApiOperation({ summary: 'Get real-time quote for a symbol' })
  @ApiParam({ name: 'symbol', required: true })
  @CacheKey('stocks:quote:symbol') // intercepted dynamically
  @CacheTTL(60)
  async getQuote(@Param('symbol') symbol: string) {
    return this.stocksService.getQuote(symbol);
  }

  @Get(':symbol/profile')
  @ApiOperation({ summary: 'Get company profile' })
  @ApiParam({ name: 'symbol', required: true })
  @CacheKey('stocks:profile:symbol')
  @CacheTTL(3600)
  async getProfile(@Param('symbol') symbol: string) {
    return this.stocksService.getProfile(symbol);
  }

  @Get(':symbol/chart')
  @ApiOperation({ summary: 'Get historical chart data' })
  @ApiParam({ name: 'symbol', required: true })
  @ApiQuery({ name: 'resolution', required: true, example: 'D' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @CacheTTL(300)
  async getChart(
    @Param('symbol') symbol: string,
    @Query('resolution') resolution: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.stocksService.getChart(symbol, resolution, parseInt(from), parseInt(to));
  }

  @Get(':symbol/news')
  @ApiOperation({ summary: 'Get company news' })
  @ApiParam({ name: 'symbol', required: true })
  @CacheKey('stocks:news:symbol')
  @CacheTTL(300)
  async getNews(@Param('symbol') symbol: string) {
    return this.stocksService.getNewsBySymbol(symbol);
  }
}
