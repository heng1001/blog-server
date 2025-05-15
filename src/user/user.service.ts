import { Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as crypto from 'crypto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
  ) {}

  async sendCodeByMail(email: string) {
    // TODO：检查是否短时间内多次请求

    // 生成随机数验证码
    const code = crypto.randomInt(100000, 999999).toString();

    // TODO：存储验证码

    // 发送验证码邮件
    await this.mailService.sendEmail(email, `验证码：${code}`, 'welcome', {
      code,
    });

    // TODO: 记录此次请求
  }
}
