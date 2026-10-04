import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert, AlertSchema } from '../../schemas/alert.schema';
import { EmailModule } from '../email/email.module';
import { StocksModule } from '../stocks/stocks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }]),
    EmailModule,
    StocksModule,
    UsersModule,
  ],
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}
