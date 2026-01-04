import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type UserAccessTokenDocument = HydratedDocument<UserAccessToken>;

@Schema({ collection: 'user_access_tokens', timestamps: true, toJSON: { versionKey: false } })
export class UserAccessToken {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  token: string;

  @Prop({ default: false })
  revoked: boolean;

  @Prop({ type: Date, default: null })
  expiresAt?: Date; // optional, but useful to know token expiration
}

export const UserAccessTokenSchema = SchemaFactory.createForClass(UserAccessToken);
