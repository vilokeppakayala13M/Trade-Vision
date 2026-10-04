import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: (requestOrigin, callback) => {
      // It's tricky to inject ConfigService here directly into the decorator.
      // We'll rely on the global CORS configuration or override it dynamically if possible.
      // For now, setting a strict origin using environment variable or a safe default.
      const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
      if (!requestOrigin) return callback(null, true);
      if (allowedOrigins.includes(requestOrigin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true
  },
  namespace: '/market',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketGateway.name);
  private subscriptions = new Map<string, Set<string>>();

  constructor(
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }
      
      const payload = jwt.verify(token, this.configService.get('jwt.secret') as string, {
        algorithms: ['HS256'],
        issuer: 'tradevision',
        audience: 'tradevision-client'
      });
      
      client.data.user = payload;
      this.subscriptions.set(client.id, new Set());
      this.logger.log(`Client connected: ${client.id}`);
      
      // Join user-specific room for alerts
      if (client.data.user.userId) {
        client.join(`user:${client.data.user.userId}`);
      }
    } catch (e) {
      this.logger.warn(`Unauthenticated client connection attempt disconnected: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.subscriptions.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() symbol: string) {
    if (!client.data.user) {
      client.disconnect(true);
      return;
    }
    const s = symbol.toUpperCase();
    const subs = this.subscriptions.get(client.id);
    
    const limit = client.data.user?.tier === 'pro' ? 50 : 10;
    if (subs && subs.size >= limit) {
      client.emit('error', { message: `Subscription limit of ${limit} reached.` });
      return;
    }

    subs?.add(s);
    client.join(`quote:${s}`);
    this.logger.debug(`Client ${client.id} subscribed to ${s}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket, @MessageBody() symbol: string) {
    if (!client.data.user) {
      client.disconnect(true);
      return;
    }
    const s = symbol.toUpperCase();
    this.subscriptions.get(client.id)?.delete(s);
    client.leave(`quote:${s}`);
    this.logger.debug(`Client ${client.id} unsubscribed from ${s}`);
  }

  broadcastQuote(symbol: string, data: any) {
    this.server.to(`quote:${symbol}`).emit('quote', data);
  }

  broadcastMarketStatus(status: any) {
    this.server.emit('market_status', status);
  }

  broadcastAlert(userId: string, alert: any) {
    this.server.to(`user:${userId}`).emit('alert_triggered', alert);
  }
}
