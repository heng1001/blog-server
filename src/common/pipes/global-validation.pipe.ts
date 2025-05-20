import {
  HttpStatus,
  ValidationError,
  ValidationPipe,
  HttpException,
} from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      // 自动删除 DTO 中未定义的属性
      // 例如：如果请求体有 {email: "xxx", age: 18}，但 DTO 只定义了 email，age 会被删除
      whitelist: true,

      // 自动转换请求数据为DTO实例
      // 例如：将字符串 "123" 转换为数字 123（如果 DTO 中定义为 number 类型）
      transform: true,

      // 启用隐式类型转换
      // 例如：查询参数 "?page=1" 会自动转换为数字 1
      transformOptions: {
        enableImplicitConversion: true,
      },

      // 自定义错误处理工厂
      exceptionFactory: (errors: ValidationError[]) => {
        // 处理验证错误
        const messages = errors.map((error) => {
          // 获取错误约束对象中的所有错误信息
          const constraints = Object.values(error.constraints || {});
          // 用分号连接多个错误信息
          return constraints.join('; ');
        });

        // 抛出异常
        return new HttpException(messages.join('; '), HttpStatus.BAD_REQUEST);
      },
    });
  }
}
