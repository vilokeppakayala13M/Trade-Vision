import { Module, Global } from '@nestjs/common';
import { SecurityLoggerService } from './services/security-logger.service';
import { CsrfService } from '../modules/auth/csrf.service';
import { EmailModule } from '../modules/email/email.module';

@Global()
@Module({
  imports: [EmailModule],
  providers: [SecurityLoggerService, CsrfService],
  exports: [SecurityLoggerService, CsrfService],
})
export class SecurityModule {}
