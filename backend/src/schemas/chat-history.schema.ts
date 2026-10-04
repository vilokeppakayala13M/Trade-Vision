import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type ChatHistoryDocument = HydratedDocument<ChatHistory>;

@Schema({ _id: false })
class ChatMessage {
  @Prop({ type: String, enum: ['user', 'assistant'], required: true })
  role: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Number })
  tokensUsed?: number;
}

@Schema({ timestamps: true })
export class ChatHistory extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId?: User;

  @Prop({ type: String, required: true })
  sessionId: string;

  @Prop({ type: String })
  symbol?: string;

  @Prop({ type: [ChatMessage], default: [] })
  messages: ChatMessage[];

  @Prop({ type: Number, default: 0 })
  totalTokensUsed: number;

  @Prop({ type: Date, default: Date.now })
  lastMessageAt: Date;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);

ChatHistorySchema.index({ userId: 1, lastMessageAt: -1 });
ChatHistorySchema.index({ lastMessageAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
