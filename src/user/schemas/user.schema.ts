import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string; // 邮箱

  @Prop({ required: true })
  password: string; // 密码
}

export const UserSchema = SchemaFactory.createForClass(User);
