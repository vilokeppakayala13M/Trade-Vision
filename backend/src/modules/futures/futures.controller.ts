import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FuturesService } from './futures.service';
import { Public } from '../../common/decorators/current-user.decorator';

@ApiTags('Futures')
@Public()
@Controller('futures')
export class FuturesController {
  constructor(private readonly futuresService: FuturesService) {}

  @Get(':symbol')
  @ApiOperation({ summary: 'Get active futures contracts for a symbol' })
  @ApiParam({ name: 'symbol', required: true })
  getActiveContracts(@Param('symbol') symbol: string) {
    return this.futuresService.getActiveContracts(symbol);
  }
}
