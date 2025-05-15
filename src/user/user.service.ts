import { Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as crypto from 'crypto';
import { RedisService } from 'src/redis/redis.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
    private redisService: RedisService,
  ) {}

  async sendCodeByMail(email: string) {
    // 验证码在redis中的键名
    const codeKey = `code:${email}`;
    // 最后发送时间的键名
    const lastSendTimeKey = `last_send_time:${email}`;

    // 检查是否短时间内多次请求
    const lastSendTime = await this.redisService.get<number>(lastSendTimeKey);
    if (lastSendTime) {
      // 计算从上次发送到现在经过的时间(秒)
      const elapsedSeconds = Math.floor((Date.now() - lastSendTime) / 1000);

      // 如果不到1分钟，拒绝请求
      if (elapsedSeconds < 60) {
        const remainingSeconds = 60 - elapsedSeconds;
        throw new Error(`请等待 ${remainingSeconds} 秒后再请求`);
      }
    }

    // 生成随机数验证码
    const code = crypto.randomInt(100000, 999999).toString();

    // 存储验证码（设置5分钟过期时间）
    await this.redisService.set(codeKey, code, 300);

    // 更新最后发送时间
    await this.redisService.set(lastSendTimeKey, Date.now(), 300);

    // 发送验证码邮件
    await this.mailService.sendEmail(email, `验证码：${code}`, 'welcome', {
      code,
    });
  }
}
