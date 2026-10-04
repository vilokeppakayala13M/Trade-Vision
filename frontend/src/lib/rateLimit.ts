import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

// In-memory fallback
const fallbackMap = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const useUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

    if (useUpstash) {
        try {
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL!,
                token: process.env.UPSTASH_REDIS_REST_TOKEN!,
            });
            // Convert windowMs to seconds for Upstash format
            const windowSeconds = Math.ceil(windowMs / 1000);
            const ratelimit = new Ratelimit({
                redis: redis,
                limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
            });
            const { success, limit: resLimit, remaining, reset } = await ratelimit.limit(key);
            return { success, limit: resLimit, remaining, reset };
        } catch (error) {
            console.error('Upstash rate limit failed, using fallback.', error);
        }
    }

    // Fallback logic
    const now = Date.now();
    
    // Clean up old entries periodically
    if (Math.random() < 0.1) {
        for (const [k, v] of fallbackMap.entries()) {
            if (now > v.resetAt) {
                fallbackMap.delete(k);
            }
        }
    }

    const record = fallbackMap.get(key);

    if (!record || now > record.resetAt) {
        fallbackMap.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
    }

    record.count++;
    if (record.count > limit) {
        return { success: false, limit, remaining: 0, reset: record.resetAt };
    }

    return { success: true, limit, remaining: limit - record.count, reset: record.resetAt };
}

// Helper to format 429 response as requested
export function createRateLimitResponse(resetAt: number): NextResponse {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return NextResponse.json(
        { error: 'Too many requests', retryAfter },
        { 
            status: 429, 
            headers: {
                'Retry-After': retryAfter.toString()
            } 
        }
    );
}
