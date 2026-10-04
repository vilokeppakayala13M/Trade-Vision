import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuid } from 'uuid';
import { ChatHistory, ChatHistoryDocument } from '../../schemas/chat-history.schema';
import { UsersService } from '../users/users.service';
import { StocksService } from '../stocks/stocks.service';
import { SendMessageDto } from './dto';

@Injectable()
export class ChatService {
  private readonly anthropic: Anthropic;
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatHistory.name) private chatHistoryModel: Model<ChatHistoryDocument>,
    private configService: ConfigService,
    private usersService: UsersService,
    private stocksService: StocksService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('anthropic.apiKey'),
    });
  }

  async handleMessage(userId: string, dto: SendMessageDto, onChunk: (chunk: string) => void) {
    const user = await this.usersService.findById(userId);
    const sessionId = dto.sessionId || uuid();
    
    let history = await this.chatHistoryModel.findOne({ sessionId, userId });
    if (!history) {
      history = new this.chatHistoryModel({
        userId,
        sessionId,
        symbol: dto.symbol,
        messages: [],
      });
    }

    const todayTokens = await this.getTokensUsedToday(userId);
    const limit = user.tier === 'pro' ? 100000 : 10000;
    if (todayTokens > limit) {
      throw new ForbiddenException(`Daily token limit of ${limit} reached. Upgrade to Pro.`);
    }

    // Prepare context
    let systemPrompt = `You are TradeVision AI, an expert Indian stock market assistant. 
    You provide crisp, professional, and accurate financial analysis. 
    Current user tier: ${user.tier}. 
    Not SEBI-registered investment advice.`;

    if (dto.symbol) {
      try {
        const quote = await this.stocksService.getQuote(dto.symbol);
        const profile = await this.stocksService.getProfile(dto.symbol);
        systemPrompt += `\nContext for ${dto.symbol} (${profile.name}): Price ₹${quote.price}, Change ${quote.change} (${quote.changePercent}%), High ₹${quote.high}, Low ₹${quote.low}, Prev Close ₹${quote.previousClose}, Volume ${quote.volume}.`;
      } catch (e) {
        this.logger.warn(`Could not fetch context for ${dto.symbol}`);
      }
    }

    history.messages.push({ role: 'user', content: dto.message, timestamp: new Date() });
    
    const messages = history.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const stream = await this.anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullResponse += chunk.delta.text;
          onChunk(chunk.delta.text);
        }
      }

      const finalMessage = await stream.finalMessage();
      const inputTokens = finalMessage.usage.input_tokens;
      const outputTokens = finalMessage.usage.output_tokens;
      const totalTokens = inputTokens + outputTokens;

      history.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        tokensUsed: totalTokens,
      });

      history.totalTokensUsed += totalTokens;
      history.lastMessageAt = new Date();
      await history.save();

      return { sessionId, fullResponse };
    } catch (error) {
      this.logger.error('Anthropic API Error:', error);
      throw new BadRequestException('Failed to generate response');
    }
  }

  async getHistory(userId: string, sessionId: string) {
    const history = await this.chatHistoryModel.findOne({ userId, sessionId }).exec();
    if (!history) throw new NotFoundException('Session not found');
    return history;
  }

  async getSessions(userId: string) {
    return this.chatHistoryModel.find({ userId }).select('sessionId symbol lastMessageAt').sort({ lastMessageAt: -1 }).exec();
  }

  private async getTokensUsedToday(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const sessions = await this.chatHistoryModel.find({
      userId,
      lastMessageAt: { $gte: startOfDay },
    });
    return sessions.reduce((acc, curr) => acc + curr.totalTokensUsed, 0);
  }
}
