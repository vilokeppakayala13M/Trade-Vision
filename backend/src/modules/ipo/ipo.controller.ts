import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from '../calendar/calendar.service';
import { Public } from '../../common/decorators/current-user.decorator';

@ApiTags('IPO')
@Public()
@Controller('ipo')
export class IpoController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent and upcoming IPOs' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getIPOs(@Query('from') from: string, @Query('to') to: string) {
    return this.calendarService.getIPOs(from, to);
  }
}
