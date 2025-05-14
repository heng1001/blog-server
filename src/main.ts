import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { generateSwaggerDocument } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局启用ValidationPipe
  app.useGlobalPipes(new ValidationPipe());

  // 统一接口路径前缀
  app.setGlobalPrefix('/api');

  // 创建swagger文档
  generateSwaggerDocument(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
