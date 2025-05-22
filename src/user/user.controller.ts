import { Controller, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { Post, Body } from '@nestjs/common';
import { RegisterMailDto } from './dto/register-mail.dto';
import { GetCodeByMailDto } from './dto/get-code-by-mail.dto';
import { LoginMailDto } from './dto/login-mail.dto';
import { NoAuth } from 'src/auth/decorators/no-auth.decorator';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 发送验证码到邮箱
  @NoAuth()
  @Post('sendCodeByMail')
  async sendCodeByMail(@Body() dto: GetCodeByMailDto) {
    try {
      await this.userService.sendCodeByMail(dto);
      return null;
    } catch (error) {
      throw new BadRequestException('发送验证码失败: ' + error);
    }
  }

  // 邮箱注册
  @NoAuth()
  @Post('registerByMail')
  async registerByMail(@Body() dto: RegisterMailDto) {
    const result = await this.userService.registerByMail(dto);
    return result;
  }

  // 邮箱登录
  @NoAuth()
  @Post('loginByMail')
  async loginByMail(@Body() dto: LoginMailDto) {
    const result = await this.userService.loginByMail(dto);
    return result;
  }
}
