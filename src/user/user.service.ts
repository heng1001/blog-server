import { Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
  ) {}

  // 邮箱注册
  async registerWithEmail(email: string, password: string) {
    // 首先检查邮箱是否已存在
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('邮箱已被注册');
    }

    // 开启事务
    const session = await this.userModel.startSession();
    session.startTransaction();

    try {
      // 先尝试发送验证邮件
      await this.mailService.sendVerificationEmail(email);

      // 邮件发送成功后，创建用户
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userModel.create(
        [
          {
            email,
            password: hashedPassword as string,
            isEmailVerified: false,
            loginMethod: 'email',
          },
        ],
        { session },
      );

      // 提交事务
      await session.commitTransaction();

      return user[0];
    } catch (error) {
      // 如果出现任何错误，回滚事务
      await session.abortTransaction();

      // 根据错误类型抛出相应的异常
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('注册失败，请稍后重试');
    } finally {
      // 结束会话
      await session.endSession();
    }
  }
}
