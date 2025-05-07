import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CatModule } from './cat/cat.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/my-blog'),
    MailModule,
    CatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
