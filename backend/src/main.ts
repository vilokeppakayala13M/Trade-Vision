import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { SecurityLoggerService } from './common/services/security-logger.service';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import mongoSanitize = require('express-mongo-sanitize');
import * as Sentry from '@sentry/nestjs';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
      beforeSend(event) {
        if (event.user) {
          delete event.user.email;
          delete event.user.username;
          delete event.user.name;
          delete event.user.ip_address;
        }
        if (event.request && event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-csrf-token'];
        }
        return event;
      },
    });
    logger.log('Sentry error monitoring initialized.');
  }

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', reason, promise);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err);
    process.exit(1);
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const securityLogger = app.get(SecurityLoggerService);
  const port = configService.get<number>('app.port') || 3001;

  app.setGlobalPrefix('api/v1');

  // Medium Vulnerability 1 - Slow loris DoS
  const server = app.getHttpServer();
  server.headersTimeout = 15000;
  server.requestTimeout = 30000;
  server.keepAliveTimeout = 65000;

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));
  app.use(cookieParser());

  // High Vulnerability 7 - CORS wildcard with credentials
  const allowedOrigins = (configService.get<string[]>('app.corsOrigins') || []).map(o => o.trim()).filter(Boolean);
  if (process.env.NODE_ENV === 'production' && (allowedOrigins.includes('*') || allowedOrigins.some(o => o.includes('localhost')))) {
    throw new Error('CORS configuration contains insecure origins (* or localhost) in production environment');
  }

  app.enableCors({
    origin: (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!requestOrigin) return callback(null, true);
      if (allowedOrigins.includes(requestOrigin)) return callback(null, true);
      logger.warn('CORS blocked request from unauthorised origin', { origin: requestOrigin });
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining', 'Retry-After'],
    credentials: true,
    maxAge: 86400,
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://accounts.google.com', 'https://www.googletagmanager.com'],
          connectSrc: ["'self'", 'https://finnhub.io', 'https://api.anthropic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        },
      },
      hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // Override CSP specifically for the Swagger API documentation endpoint since it requires inline scripts
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/docs')) {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:;"
      );
    }
    next();
  });

  app.use(compression());
  app.use(morgan('combined'));

  // Critical Vulnerability 2 - NoSQL injection
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn('NoSQL injection attempt detected', { key, ip: req.ip });
      securityLogger.logNoSQLInjectionAttempt(req.ip || 'unknown', key, 'Sanitized by mongoSanitize', req.path);
    },
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, securityLogger));

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const swaggerUser = configService.get<string>('SWAGGER_USERNAME') || process.env.SWAGGER_USERNAME;
    const swaggerPass = configService.get<string>('SWAGGER_PASSWORD') || process.env.SWAGGER_PASSWORD;

    if (swaggerUser && swaggerPass) {
      app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        const path = req.path;
        if (path.startsWith('/api/docs')) {
          const authheader = req.headers.authorization;
          if (!authheader) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Docs"');
            return res.status(401).send('Authentication required.');
          }

          const parts = authheader.split(' ');
          if (parts[0] !== 'Basic' || !parts[1]) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Docs"');
            return res.status(401).send('Authentication required.');
          }

          const auth = Buffer.from(parts[1], 'base64').toString().split(':');
          const user = auth[0];
          const pass = auth[1];

          if (user === swaggerUser && pass === swaggerPass) {
            next();
          } else {
            res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Docs"');
            return res.status(401).send('Authentication required.');
          }
        } else {
          next();
        }
      });
    }

    const config = new DocumentBuilder()
      .setTitle('TradeVision API')
      .setDescription('Complete Indian stock market platform API')
      .setVersion('2.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addTag('Auth')
      .addTag('Stocks')
      .addTag('Portfolio')
      .addTag('Paper Trading')
      .addTag('Alerts')
      .addTag('Chat')
      .addTag('Calendar')
      .addTag('Users')
      .addTag('Admin')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  if (!isProduction) {
    const swaggerUser = configService.get<string>('SWAGGER_USERNAME') || process.env.SWAGGER_USERNAME;
    const swaggerPass = configService.get<string>('SWAGGER_PASSWORD') || process.env.SWAGGER_PASSWORD;
    if (swaggerUser && swaggerPass) {
      logger.log(`📚 Swagger documentation enabled (Protected) at: http://localhost:${port}/api/docs`);
    } else {
      logger.log(`📚 Swagger documentation enabled (Public) at: http://localhost:${port}/api/docs`);
    }
  } else {
    logger.log(`📚 Swagger documentation is disabled in production environment`);
  }
}
bootstrap();
