import { SetMetadata } from '@nestjs/common';

// 创建一个装饰器，用于标记不需要登录的路由
export const NoAuth = () => SetMetadata('noAuth', true);
