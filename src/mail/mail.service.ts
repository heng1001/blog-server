import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // 发送注册验证码邮件
  async sendRegisterVerificationEmail(email: string) {
    // 生成随机数验证码
    const code = crypto.randomInt(100000, 999999).toString();

    try {
      await this.mailerService.sendMail({
        to: email, // 收件人
        from: process.env.MAIL_FROM, // 发件人
        subject: `验证码：${code}`, // 主题
        template: 'welcome', // 使用模板
        context: {
          code,
        },
      });

      return code;
    } catch (error) {
      console.error('发送验证码邮件失败', error);
      throw new Error('邮件发送失败，请稍后重试');
    }
  }
}
