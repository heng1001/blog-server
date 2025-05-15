import { Controller, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Post, Body } from '@nestjs/common';

// 邮箱获取验证码dto
class GetCodeByMailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 发送验证码到邮箱
  @Post('sendCodeByMail')
  async sendCodeByMail(@Body() dto: GetCodeByMailDto) {
    try {
      await this.userService.sendCodeByMail(dto.email);
      return {
        code: 200,
        message: '验证码发送成功',
        data: null,
      };
    } catch (error) {
      throw new BadRequestException('发送验证码失败: ' + error);
    }
  }
}
