import { IsString, IsNumber, IsEnum, Min, Max, IsOptional, Matches, MaxLength, IsDateString, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SAFE_PATTERNS } from '../../../common/utils/safe-regex.util';

export class CreateOrderDto {
  @ApiProperty({ example: 'RELIANCE' })
  @IsString()
  @MaxLength(30)
  symbol: string;

  @ApiPropertyOptional({ example: 'Reliance Industries Ltd' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ enum: ['buy', 'sell', 'BUY', 'SELL'], example: 'buy' })
  @IsString()
  @IsEnum(['buy', 'sell', 'BUY', 'SELL'], { message: 'side must be buy or sell' })
  side: 'buy' | 'sell' | 'BUY' | 'SELL';

  @ApiPropertyOptional({ enum: ['market', 'MARKET'], example: 'market', default: 'market' })
  @IsOptional()
  @IsString()
  @IsEnum(['market', 'MARKET'], { message: 'type must be market for v1' })
  type?: 'market' | 'MARKET' = 'market';

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive({ message: 'quantity must be a positive number' })
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 2500.50 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}

export class ExecuteTradeDto {
  @ApiProperty({ example: 'RELIANCE' })
  @IsString()
  @MaxLength(15)
  @Matches(SAFE_PATTERNS.NSE_SYMBOL)
  symbol: string;

  @ApiProperty({ example: 'Reliance Industries Ltd' })
  @IsString()
  @MaxLength(100)
  companyName: string;

  @ApiProperty({ enum: ['BUY', 'SELL'], example: 'BUY' })
  @IsEnum(['BUY', 'SELL'])
  action: 'BUY' | 'SELL';

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 2500.50 })
  @IsNumber()
  @Min(0.01)
  price: number;
}

export class GetTradeHistoryDto {
  @ApiPropertyOptional({ example: 'RELIANCE' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Matches(SAFE_PATTERNS.NSE_SYMBOL)
  symbol?: string;

  @ApiPropertyOptional({ enum: ['BUY', 'SELL', 'buy', 'sell'] })
  @IsOptional()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;
}
