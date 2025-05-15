import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

// 邮件上下文
interface EmailContext {
  [key: string]: string | number | boolean | null | undefined;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {
    if (!process.env.MAIL_FROM) {
      this.logger.warn('MAIL_FROM 环境变量未设置，将使用默认发件人');
    }
  }

  // 发送邮件
  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: EmailContext,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to, // 收件人
        from: process.env.MAIL_FROM || 'noreply@example.com', // 发件人
        subject, // 主题
        template, // 使用模板
        context,
      });
      this.logger.log(`邮件发送成功: ${to}`);
    } catch (error) {
      this.logger.error(`邮件发送失败: ${to}`, error);
      throw new Error('邮件发送失败，请稍后重试');
    }
  }
}
