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

    // 检查是否短时间内多次请求
    const existingCode = await this.redisService.get<string>(codeKey);
    if (existingCode) {
      // 获取剩余过期时间
      const ttl = await this.redisService.ttl(codeKey);
      console.log(ttl, 'ttl---');
      if (ttl < 300) {
        throw new Error('验证码已发送，请勿频繁请求');
      }
    }

    // 生成随机数验证码
    const code = crypto.randomInt(100000, 999999).toString();

    // 存储验证码（设置5分钟过期时间）
    await this.redisService.set(codeKey, code, 300);

    // 发送验证码邮件
    await this.mailService.sendEmail(email, `验证码：${code}`, 'welcome', {
      code,
    });
  }
}
