import * as path from 'path';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MailController } from './mail.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // 配置邮件模块
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>('MAIL_SERVER'), // QQ邮箱SMTP服务器
            port: configService.get<number>('MAIL_PORT'), // QQ邮箱SMTP端口
            secure: true, // 使用SSL加密连接
            auth: {
              user: configService.get<string>('MAIL_USER'), // 邮箱账号
              pass: configService.get<string>('MAIL_PASSWORD'), // 邮箱授权码
            },
          },
          defaults: {
            from: '"迟迟" <2675988015@qq.com>', // 发件人
          },
          preview: true, // 启用邮件预览功能（开发环境有用）
          template: {
            dir: path.join(process.cwd(), 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
