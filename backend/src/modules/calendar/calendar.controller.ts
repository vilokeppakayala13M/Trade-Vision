import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { Public } from '../../common/decorators/current-user.decorator';

@ApiTags('Calendar')
@Public()
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('earnings')
  @ApiOperation({ summary: 'Get earnings calendar' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getEarnings(@Query('from') from: string, @Query('to') to: string) {
    return this.calendarService.getEarnings(from, to);
  }

  @Get('ipos')
  @ApiOperation({ summary: 'Get IPO calendar' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getIPOs(@Query('from') from: string, @Query('to') to: string) {
    return this.calendarService.getIPOs(from, to);
  }

  @Get('economic')
  @ApiOperation({ summary: 'Get economic calendar' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getEconomicEvents(@Query('from') from: string, @Query('to') to: string) {
    return this.calendarService.getEconomicEvents(from, to);
  }
}
