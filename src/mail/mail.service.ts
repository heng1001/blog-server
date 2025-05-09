import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // 发送验证码邮件
  async sendVerificationEmail(email: string) {
    // 验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      await this.mailerService.sendMail({
        to: email, // list of receivers
        from: '"nest-modules" <modules@nestjs.com>', // sender address
        subject: '验证码', // Subject line
        text: 'welcome', // plaintext body
        html: '<b>welcome</b>', // HTML body content
        context: {
          code,
        },
      });

      // TODO:验证码5min过期（redis）

      return code;
    } catch (error) {
      console.error('发送验证码邮件失败', error);
      throw new Error('邮件发送失败，请稍后重试');
    }
  }
}
