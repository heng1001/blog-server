import { Module } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { MinioClientController } from './minio.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestMinioModule } from 'nestjs-minio';

@Module({
  imports: [
    ConfigModule,
    NestMinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        endPoint: configService.get<string>('MINIO_ENDPOINT', 'localhost'),
        port: configService.get<number>('MINIO_PORT', 9000),
        useSSL: configService.get<boolean>('MINIO_USE_SSL', false),
        accessKey: configService.get<string>('MINIO_ACCESS_KEY', ''),
        secretKey: configService.get<string>('MINIO_SECRET_KEY', ''),
      }),
    }),
  ],
  providers: [MinioClientService],
  controllers: [MinioClientController],
  exports: [MinioClientService],
})
export class MinioClientModule {}
