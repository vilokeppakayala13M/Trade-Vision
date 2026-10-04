import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('email')
  async handleEmail(job: Job) {
    const { type, to, name, token, alert, currentPrice, deletionDate, trade, ticketId } = job.data;

    switch (type) {
      case 'verification':
        await this.emailService.sendVerification(to, name, token);
        break;
      case 'password-reset':
        await this.emailService.sendPasswordReset(to, name, token);
        break;
      case 'welcome':
        await this.emailService.sendWelcome(to, name);
        break;
      case 'alert-triggered':
        await this.emailService.sendAlertTriggered(to, name, alert, currentPrice);
        break;
      case 'account-deletion':
        await this.emailService.sendAccountDeletion(to, name, new Date(deletionDate));
        break;
      case 'trade-confirmation':
        await this.emailService.sendTradeConfirmation(to, name, trade);
        break;
      case 'contact-form':
        await this.emailService.sendContactFormAck(to, name, ticketId);
        break;
      default:
        this.logger.warn(`Unknown email job type: ${type}`);
    }
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Failed to process email job ${job.id} of type ${job.data.type}`, error.stack);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Successfully processed email job ${job.id} of type ${job.data.type}`);
  }
}
