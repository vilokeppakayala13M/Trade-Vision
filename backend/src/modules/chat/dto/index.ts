import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'What is the RSI of RELIANCE?' })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiProperty({ example: 'session-uuid', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ example: 'RELIANCE', required: false })
  @IsOptional()
  @IsString()
  symbol?: string;
}
