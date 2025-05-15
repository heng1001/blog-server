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
            secure: configService.get<boolean>('MAIL_USE_SSL'), // 使用SSL加密连接
            auth: {
              user: configService.get<string>('MAIL_USER'), // 邮箱账号
              pass: configService.get<string>('MAIL_PASSWORD'), // 邮箱授权码
            },
          },
          defaults: {
            from: configService.get<string>('MAIL_FROM'), // 发件人
          },
          preview: true, // 启用邮件预览功能（开发环境有用）
          // 模板配置
          template: {
            dir: path.join(process.cwd(), 'templates/pages'),
            adapter: new HandlebarsAdapter(), // 使用Handlebars作为模板引擎
            options: {
              strict: true, // 严格模式，变量未定义会报错
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
