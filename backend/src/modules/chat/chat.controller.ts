import { Controller, Post, Body, Get, Param, Sse, UseGuards, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';

@ApiTags('Chat')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Stream chat response via SSE' })
  streamMessage(@CurrentUserId() userId: string, @Req() req: Request): Observable<MessageEvent> {
    const dto: SendMessageDto = {
      message: req.query.message as string,
      sessionId: req.query.sessionId as string,
      symbol: req.query.symbol as string,
    };

    return new Observable((subscriber) => {
      this.chatService.handleMessage(userId, dto, (chunk) => {
        subscriber.next({ data: { chunk } } as MessageEvent);
      }).then(({ sessionId, fullResponse }) => {
        subscriber.next({ data: { done: true, sessionId } } as MessageEvent);
        subscriber.complete();
      }).catch((err) => {
        this.logger.error('Stream error', err);
        subscriber.error(err);
      });
    });
  }

  @Post()
  @ApiOperation({ summary: 'Send chat message synchronously' })
  async sendMessage(@CurrentUserId() userId: string, @Body() dto: SendMessageDto) {
    const chunks: string[] = [];
    const result = await this.chatService.handleMessage(userId, dto, (chunk) => {
      chunks.push(chunk);
    });
    return {
      sessionId: result.sessionId,
      response: result.fullResponse,
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get user chat sessions' })
  getSessions(@CurrentUserId() userId: string) {
    return this.chatService.getSessions(userId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get chat history for session' })
  getHistory(@CurrentUserId() userId: string, @Param('id') sessionId: string) {
    return this.chatService.getHistory(userId, sessionId);
  }
}
