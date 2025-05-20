// 1. 导入所需的模块
import {
  ExceptionFilter, // 异常过滤器接口，所有的异常过滤器都要实现这个接口
  Catch, // 捕获异常的装饰器
  ArgumentsHost, // 用于获取请求和响应对象的工具
  HttpException, // Nest 内置的 HTTP 异常基类
  Logger, // Nest 内置的日志工具
} from '@nestjs/common';
import { Response, Request } from 'express'; // Express 的请求和响应类型

// 2. 定义 HTTP 异常响应的数据结构
interface HttpExceptionResponse {
  statusCode: number; // HTTP 状态码
  message: string | string[]; // 错误信息，可以是字符串或字符串数组
  error: string; // 错误类型
}

// 3. 定义请求信息的数据结构，用于日志记录
interface RequestInfo {
  path: string; // 请求路径
  method: string; // 请求方法（GET, POST 等）
  body: Record<string, unknown>; // 请求体数据
  query: Record<string, unknown>; // URL 查询参数
  timestamp: string; // 请求时间戳
}

// 4. 异常过滤器类定义
@Catch() // @Catch() 装饰器不传参数表示捕获所有类型的异常
export class GlobalExceptionFilter implements ExceptionFilter {
  // 创建日志记录器实例
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  // 5. 实现 catch 方法，用于处理捕获到的异常
  catch(exception: Error | HttpException, host: ArgumentsHost) {
    // 获取 HTTP 上下文（请求和响应对象）
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 6. 收集请求信息，用于日志记录
    const requestInfo: RequestInfo = {
      path: request.url, // 请求的 URL
      method: request.method, // 请求方法
      body: request.body as Record<string, unknown>, // 请求体
      query: request.query as Record<string, unknown>, // 查询参数
      timestamp: new Date().toISOString(), // 时间戳
    };

    // 7. 初始化错误信息和错误码
    let errorMessage = '服务器内部错误'; // 默认错误信息
    let errorCode = 1; // 默认错误码

    // 8. 处理异常
    if (exception instanceof HttpException) {
      // 如果是 HTTP 异常
      // 获取异常的响应数据
      const exceptionResponse = exception.getResponse() as
        | string
        | HttpExceptionResponse;

      // 提取错误信息
      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse; // 如果是字符串直接使用
      } else {
        // 如果是对象，且 message 是数组，取第一个错误信息
        errorMessage = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message[0]
          : exceptionResponse.message;
      }

      // 9. 根据不同的 HTTP 状态码设置错误码
      switch (exception.getStatus()) {
        case 400:
          errorCode = 400; // 参数错误
          break;
        case 401:
          errorCode = 401; // 未授权
          break;
        case 403:
          errorCode = 403; // 禁止访问
          break;
        default:
          errorCode = 500; // 其他错误
      }
    } else if (exception instanceof Error) {
      // 如果是普通的 Error
      errorMessage = exception.message; // 使用错误信息
    }

    // 10. 记录错误日志
    this.logger.error(
      `Error in request: ${JSON.stringify(requestInfo)}`, // 记录请求信息
      exception.stack, // 记录错误堆栈
    );

    // 11. 发送统一格式的错误响应
    response.status(200).json({
      // HTTP 状态码统一为 200
      status: errorCode, // 业务状态码
      message: errorMessage, // 错误信息
      data: null, // 错误时数据为空
    });
  }
}
