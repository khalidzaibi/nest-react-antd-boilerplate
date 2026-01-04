import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type UserDetailsDocument = HydratedDocument<UserDetails>;

@Schema({ collection: 'user_details', timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class UserDetails {
  _id: string;

  @Prop()
  address?: string;

  @Prop()
  phone?: string;

  @Prop()
  dob?: Date;

  // belongsTo User
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const UserDetailsSchema = SchemaFactory.createForClass(UserDetails);

// Safe DTO for returning to API (no mongoose metadata)
export class SafeUserDetailsDto {
  _id: string;
  address?: string;
  phone?: string;
  dob?: Date;
  user: string; // only expose the User id here, or you can populate later
}
