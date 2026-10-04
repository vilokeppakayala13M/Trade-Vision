import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { AuthModule } from '../auth/auth.module';
import { PaperTradingModule } from '../paper-trading/paper-trading.module';

@Module({
  imports: [AuthModule, PaperTradingModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
