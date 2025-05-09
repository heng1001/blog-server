import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string; // 邮箱

  @Prop({ required: true })
  password: string; // 密码

  @Prop()
  name: string; // 用户名

  @Prop()
  avatar: string; // 头像

  @Prop()
  phone: string; // 手机号

  @Prop()
  createdAt: Date; // 创建时间

  @Prop()
  lastLoginAt: Date; // 最后登录时间

  @Prop()
  isActive: boolean; // 是否激活
}

export const UserSchema = SchemaFactory.createForClass(User);
