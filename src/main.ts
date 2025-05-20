import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { generateSwaggerDocument } from './swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/globalException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局启用ValidationPipe
  app.useGlobalPipes(new ValidationPipe());

  // 全局注册响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局注册异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 统一接口路径前缀
  app.setGlobalPrefix('/api');

  // 创建swagger文档
  generateSwaggerDocument(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
