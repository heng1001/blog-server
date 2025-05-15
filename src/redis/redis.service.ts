import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 获取值
   * @param key 键
   */
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  /**
   * 设置值
   * @param key 键
   * @param value 值
   */
  async set<T>(key: string, value: T, seconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (seconds) {
      await this.redis.set(key, serializedValue, 'EX', seconds);
    } else {
      await this.redis.set(key, serializedValue);
    }
  }

  /**
   * 删除值
   * @param key 键
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * 获取键的剩余过期时间（秒）
   * @param key 键
   * @returns 剩余秒数，-1 表示永不过期，-2 表示键不存在
   */
  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }
}
