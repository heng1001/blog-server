import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const generateSwaggerDocument = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('接口文档')
    .setDescription('这是一个接口文档👀')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('/swagger', app, document);
};
