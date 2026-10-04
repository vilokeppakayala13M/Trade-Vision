export const SAFE_PATTERNS = {
  // linear - anchored, no alternation, fixed repetition
  PHONE: /^[6-9]\d{9}$/,
  
  // linear - character class, bounded repetition
  NSE_SYMBOL: /^[A-Z&.-]{1,15}$/,
  
  // linear - character class, bounded
  EMAIL_LOCAL: /^[a-zA-Z0-9._%+-]{1,64}$/,
  
  // linear - character class, exact repetition
  OBJECT_ID: /^[a-f\d]{24}$/i,
  
  // linear - exact repetition
  TOKEN_HEX: /^[a-f0-9]{64}$/i,
  
  // linear
  JWT_FORMAT: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
};

export function safeMatch(input: string, pattern: RegExp, maxLength: number): boolean {
  if (input.length > maxLength) {
    return false;
  }
  return pattern.test(input);
}
