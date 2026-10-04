import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({ example: 'RELIANCE' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'Reliance Industries Ltd' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  targetPrice: number;

  @ApiProperty({ enum: ['ABOVE', 'BELOW'], example: 'ABOVE' })
  @IsEnum(['ABOVE', 'BELOW'])
  direction: 'ABOVE' | 'BELOW';

  @ApiProperty({ type: [String], enum: ['push', 'email'], example: ['email'] })
  @IsArray()
  notifyVia: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAlertDto {
  @ApiProperty({ example: 2600, required: false })
  @IsOptional()
  @IsNumber()
  targetPrice?: number;

  @ApiProperty({ enum: ['ABOVE', 'BELOW'], required: false })
  @IsOptional()
  @IsEnum(['ABOVE', 'BELOW'])
  direction?: 'ABOVE' | 'BELOW';

  @ApiProperty({ type: [String], enum: ['push', 'email'], required: false })
  @IsOptional()
  @IsArray()
  notifyVia?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
