import { IsEmail, IsString } from 'class-validator';

export class LoginMailDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
