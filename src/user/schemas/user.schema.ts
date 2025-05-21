import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string; // 邮箱

  @Prop()
  username: string; // 用户名

  @Prop({ required: true })
  password: string; // 加密后的密码

  @Prop({ required: true })
  salt: string; // 密码盐值

  @Prop({ default: Date.now })
  createdAt: Date; // 创建时间

  @Prop({ default: Date.now })
  updatedAt: Date; // 更新时间
}

export const UserSchema = SchemaFactory.createForClass(User);
