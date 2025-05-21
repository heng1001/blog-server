import { IsEmail, IsNotEmpty } from 'class-validator';

// 邮箱获取验证码dto
export class GetCodeByMailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
