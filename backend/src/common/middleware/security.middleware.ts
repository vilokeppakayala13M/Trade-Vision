import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // ReDoS mitigation: strict content-length limit before body parsing
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > 1048576) { // 1MB
      this.logger.warn(`Blocked request due to oversized payload: ${contentLength} bytes - IP: ${req.ip}`);
      return res.status(413).json({ code: 'PAYLOAD_TOO_LARGE', message: 'Payload Too Large' });
    }

    const ua = req.headers['user-agent'] || '';
    const maliciousUAs = ['sqlmap', 'nikto', 'masscan'];
    if (ua === '' || maliciousUAs.some((m) => ua.toLowerCase().includes(m))) {
      this.logger.warn(`Blocked request from malicious user-agent: ${ua} - IP: ${req.ip}`);
      return res.status(403).json({ code: 'SUSPICIOUS_REQUEST', message: 'Request blocked' });
    }

    const pathTraversalRegex = /\.\.\/|\.\.\\/;
    if (pathTraversalRegex.test(req.url)) {
      this.logger.warn(`Blocked request due to path traversal pattern: ${req.url} - IP: ${req.ip}`);
      return res.status(403).json({ code: 'SUSPICIOUS_REQUEST', message: 'Request blocked' });
    }

    next();
  }
}
