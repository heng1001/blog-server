import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RegisterMailDto {
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '邮箱格式不正确',
    },
  )
  email: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @Length(6, 20, {
    message: '密码长度必须在6到20个字符之间',
  })
  password: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  code: string;
}
