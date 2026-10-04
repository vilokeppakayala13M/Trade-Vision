import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().optional().default('3001'),
  NODE_ENV: z.string().optional().default('development'),
  CORS_ORIGINS: z.string().optional().default('http://localhost:3000'),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters — generate with: openssl rand -hex 32'),
  JWT_REFRESH_SECRET: z.string().min(64, 'JWT_REFRESH_SECRET must be at least 64 characters'),
  UPSTASH_REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),
  FINNHUB_API_KEY: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional().default('noreply@tradevision.in'),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional().default('http://localhost:3000'),
});

export const validateConfig = (config: Record<string, unknown>) => {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Config validation error:\n${errors}`);
  }
  return parsed.data;
};

export interface AppConfig {
  app: {
    port: number;
    env: string;
    apiPrefix: string;
    corsOrigins: string[];
  };
  database: {
    uri: string;
    options: any;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  redis: {
    url?: string;
    token?: string;
    ttl: number;
  };
  finnhub: {
    apiKey: string;
    baseUrl: string;
  };
  smtp: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    from: string;
  };
  anthropic: {
    apiKey?: string;
  };
  google: {
    clientId?: string;
    clientSecret?: string;
  };
  razorpay: {
    keyId?: string;
    keySecret?: string;
  };
  app_url: string;
}

export default (): AppConfig => ({
  app: {
    port: Number(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || 'development',
    apiPrefix: 'api/v1',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  },
  database: {
    uri: process.env.MONGODB_URI as string,
    options: {
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  redis: {
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
    ttl: 60,
  },
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY as string,
    baseUrl: 'https://finnhub.io/api/v1',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    user: process.env.SMTP_USER || 'supporttradevision@gmail.com',
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'supporttradevision@gmail.com',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});
