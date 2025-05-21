import { Controller, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { Post, Body } from '@nestjs/common';
import { RegisterMailDto } from './dto/register-mail.dto';
import { GetCodeByMailDto } from './dto/get-code-by-mail.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 发送验证码到邮箱
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
  @Post('registerByMail')
  async registerByMail(@Body() dto: RegisterMailDto) {
    const result = await this.userService.registerByMail(dto);
    return result;
  }
}
