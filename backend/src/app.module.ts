import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { redisStore } from 'cache-manager-redis-store';
import configuration, { validateConfig } from './config/configuration';
import { SecurityModule } from './common/security.module';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { SanitiseBodyMiddleware } from './common/middleware/sanitise-body.middleware';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { PaperTradingModule } from './modules/paper-trading/paper-trading.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ChatModule } from './modules/chat/chat.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { NewsModule } from './modules/news/news.module';
import { IpoModule } from './modules/ipo/ipo.module';
import { FuturesModule } from './modules/futures/futures.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateConfig,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('database.uri'),
        ...config.get('database.options'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { name: 'short', ttl: 1000, limit: 10 },
        { name: 'medium', ttl: 60000, limit: 60 },
        { name: 'long', ttl: 900000, limit: 100 },
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get('redis.url');
        return redisUrl
          ? { store: redisStore as any, url: redisUrl, ttl: config.get('redis.ttl') }
          : { ttl: 60, max: 1000 };
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get('redis.url')
          ? config.get('redis.url')
          : { host: 'localhost', port: 6379 },
      }),
    }),
    ScheduleModule.forRoot(),
    HttpModule.register({ timeout: 10000, maxRedirects: 3 }),
    SecurityModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    StocksModule,
    PaperTradingModule,
    AlertsModule,
    ChatModule,
    CalendarModule,
    NewsModule,
    IpoModule,
    FuturesModule,
    AdminModule,
    HealthModule,
    WebsocketModule,
    SchedulerModule,
    EmailModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, SanitiseBodyMiddleware)
      .forRoutes('*');
  }
}
