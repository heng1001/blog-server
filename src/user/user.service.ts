import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as crypto from 'crypto';
import { RedisService } from 'src/redis/redis.service';
import { RegisterMailDto } from './dto/register-mail.dto';
import { GetCodeByMailDto } from './dto/get-code-by-mail.dto';
import { LoginMailDto } from './dto/login-mail.dto';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
    private redisService: RedisService,
    private authService: AuthService,
  ) {}

  // 发送验证码到邮箱
  async sendCodeByMail(dto: GetCodeByMailDto) {
    // 验证码在redis中的键名
    const codeKey = `code:${dto.email}`;
    // 最后发送时间的键名
    const lastSendTimeKey = `last_send_time:${dto.email}`;

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
    await this.mailService.sendEmail(dto.email, `验证码：${code}`, 'welcome', {
      code,
    });
  }

  // 邮箱注册
  async registerByMail(dto: RegisterMailDto) {
    const { email, password, code } = dto;

    // 检查邮箱是否已被注册
    const existUser = await this.userModel.findOne({ email });
    if (existUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 验证码校验
    const codeKey = `code:${email}`;
    const saveCode = await this.redisService.get<string>(codeKey);

    if (!saveCode) {
      throw new BadRequestException('验证码已过期，请重新获取');
    }

    if (saveCode !== code) {
      throw new BadRequestException('验证码错误');
    }

    // 密码加密
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');

    // 生成随机用户名
    const randomString = crypto.randomBytes(8).toString('hex');
    const username = `用户_${randomString}`;

    // 创建新用户
    const newUser = await this.userModel.create({
      email,
      username,
      password: hash,
      salt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 删除Redis中的验证码
    await this.redisService.del(codeKey);

    // 返回结果
    const userObj = newUser.toJSON();
    const result = Object.fromEntries(
      Object.entries(userObj).filter(
        ([key]) => !['password', 'salt'].includes(key),
      ),
    );
    return result;
  }

  // 邮箱登录
  async loginByMail(dto: LoginMailDto) {
    const { email, password } = dto;

    // 查找用户
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证密码
    const hash = crypto
      .pbkdf2Sync(password, user.salt, 1000, 64, 'sha512')
      .toString('hex');
    if (hash !== user.password) {
      throw new UnauthorizedException('密码错误');
    }

    // 生成token
    const payload = {
      email: user.email,
      id: user._id.toString(),
    };
    const token = this.authService.generateToken(payload);

    return token;
  }
}
