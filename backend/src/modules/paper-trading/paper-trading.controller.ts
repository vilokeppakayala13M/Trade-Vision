import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaperTradingService } from './paper-trading.service';
import { CreateOrderDto, ExecuteTradeDto, GetTradeHistoryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';

@ApiTags('Paper Trading')
@UseGuards(JwtAuthGuard)
@Controller('paper-trading')
export class PaperTradingController {
  constructor(private readonly paperTradingService: PaperTradingService) {}

  @Post('account')
  @ApiOperation({ summary: 'Create paper account (idempotent)' })
  createAccount(@CurrentUserId() userId: string) {
    return this.paperTradingService.createAccount(userId);
  }

  @Get('account')
  @ApiOperation({ summary: 'Get paper account balance and equity' })
  getAccount(@CurrentUserId() userId: string) {
    return this.paperTradingService.getAccount(userId);
  }

  @Post('account/reset')
  @ApiOperation({ summary: 'Reset paper account balance and positions' })
  resetAccount(@CurrentUserId() userId: string) {
    return this.paperTradingService.resetAccount(userId);
  }

  @Get('positions')
  @ApiOperation({ summary: 'List open paper positions' })
  getPositions(@CurrentUserId() userId: string) {
    return this.paperTradingService.getPositions(userId);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Place a paper buy/sell order' })
  placeOrder(@CurrentUserId() userId: string, @Body() dto: CreateOrderDto) {
    return this.paperTradingService.placeOrder(userId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get order history' })
  getOrders(
    @CurrentUserId() userId: string,
    @Query() query: GetTradeHistoryDto,
  ) {
    return this.paperTradingService.getOrders(userId, query);
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: 'Cancel a pending order' })
  cancelOrder(
    @CurrentUserId() userId: string,
    @Param('id') orderId: string,
  ) {
    return this.paperTradingService.cancelOrder(userId, orderId);
  }

  // --- Legacy Route Compatibility ---
  @Get('portfolio')
  getPortfolio(@CurrentUserId() userId: string) {
    return this.paperTradingService.getAccount(userId);
  }

  @Post('trade')
  executeTrade(@CurrentUserId() userId: string, @Body() dto: ExecuteTradeDto) {
    return this.paperTradingService.executeTrade(userId, dto);
  }

  @Get('history')
  getHistory(
    @CurrentUserId() userId: string,
    @Query() query: GetTradeHistoryDto,
  ) {
    return this.paperTradingService.getOrders(userId, query);
  }

  @Post('reset')
  resetPortfolio(@CurrentUserId() userId: string) {
    return this.paperTradingService.resetAccount(userId);
  }
}
