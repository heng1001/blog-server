// 1. 导入必要的依赖
import {
  CanActivate, // 守卫必须实现的接口
  ExecutionContext, // 执行上下文，包含请求信息
  Injectable, // 依赖注入装饰器
  UnauthorizedException, // 未授权异常
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // 用于获取元数据
import { AuthService } from '../auth.service'; // 认证服务
import { Request } from 'express'; // Express 的请求类型

// 2. 定义扩展的请求接口，添加用户信息
interface RequestWithUser extends Request {
  user?: {
    id: string; // 用户ID
    email: string; // 用户邮箱
    iat: number; // token签发时间
    exp: number; // token过期时间
  };
}

// 3. 定义认证守卫类
@Injectable() // 标记为可注入的服务
export class AuthGuard implements CanActivate {
  // 4. 构造函数，注入需要的服务
  constructor(
    private readonly reflector: Reflector, // 用于获取路由元数据
    private readonly authService: AuthService, // 用于token验证
  ) {}

  // 5. 实现 canActivate 方法
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 6. 获取请求对象
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // 7. 检查是否是公开路由（不需要登录、通过 @NoAuth() 装饰器标记）
    const noAuth = this.reflector.get<boolean>('noAuth', context.getHandler());
    if (noAuth) {
      return true; // 如果是公开路由，直接放行
    }

    // 8. 获取请求头中的 token
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('未登录'); // 没有token则抛出异常
    }

    // 9. 解析 token
    const [type, token] = authHeader.split(' ');
    // 检查 token 格式（Bearer token格式）
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('无效的token格式');
    }

    try {
      // 10. 验证和解码 token
      const decoded = await this.authService.decodeJwtToken(token);

      // 11. 检查 token 是否过期
      if (decoded.exp < Date.now()) {
        throw new UnauthorizedException('token已过期');
      }

      // 12. 将解码后的用户信息添加到请求对象中
      request.user = decoded;
      return true; // 验证通过
    } catch (error) {
      // 13. 处理验证过程中的错误
      throw new UnauthorizedException('无效的token' + error);
    }
  }
}
