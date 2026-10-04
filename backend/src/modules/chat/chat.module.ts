import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatHistory, ChatHistorySchema } from '../../schemas/chat-history.schema';
import { StocksModule } from '../stocks/stocks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatHistory.name, schema: ChatHistorySchema }]),
    StocksModule,
    UsersModule,
  ],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
