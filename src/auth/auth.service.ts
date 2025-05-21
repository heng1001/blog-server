import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// 定义JWT payload的类型
type JwtPayload = {
  id: string;
  email: string;
  iat: number; // token签发时间（issued at）
  exp: number; // token过期时间（expiration time）
};

// 定义解码后的token类型
type DecodedToken = Record<'id' | 'email', string> &
  Record<'iat' | 'exp', number>;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 生成token
  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
    // Omit表示排除JwtPayload中的iat和exp字段，因为这两个字段由JWT自动生成
    return this.jwtService.sign(payload);
  }

  // 验证和解码token
  async decodeJwtToken(token: string): Promise<DecodedToken> {
    try {
      // 验证token
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('SECRET'),
      });

      // 返回解码后的数据
      return {
        id: decoded.id,
        email: decoded.email,
        iat: decoded.iat * 1000,
        exp: decoded.exp * 1000,
      };
    } catch {
      throw new UnauthorizedException('无效的token或token已过期');
    }
  }
}
