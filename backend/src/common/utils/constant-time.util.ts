import * as crypto from 'crypto';

export function constantTimeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  
  if (bufferA.length !== bufferB.length) {
    // To prevent timing leaks on length mismatches, we compare a dummy buffer against itself.
    // This ensures a timing safe comparison occurs even on length mismatch, 
    // although the early exit above makes it slightly leaky for length, which is usually acceptable.
    // A fully timing-safe length mismatch check:
    crypto.timingSafeEqual(bufferA, bufferA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export async function addJitter(baseMs: number, jitterMs: number): Promise<void> {
  const waitMs = baseMs + Math.random() * jitterMs;
  return new Promise(resolve => setTimeout(resolve, waitMs));
}
