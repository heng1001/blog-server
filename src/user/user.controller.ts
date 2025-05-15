import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { Post, Body } from '@nestjs/common';
import { RegisterMailDto } from './dto/register.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('registerMail')
  async registerMail(@Body() registerMailDto: RegisterMailDto) {
    const user = await this.userService.registerWithEmail(
      registerMailDto.email,
      registerMailDto.password,
    );

    return {
      code: 200,
      message: '注册成功，请查收验证邮件',
      data: {
        email: user.email,
      },
    };
  }
}
