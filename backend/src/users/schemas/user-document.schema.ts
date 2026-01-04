import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type UserDocumentDoc = HydratedDocument<UserDocument>;

@Schema({ collection: 'user_documents', timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class UserDocument {
  _id: string;

  @Prop()
  docType: string;

  @Prop()
  fileUrl: string;

  // belongsTo User
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const UserDocumentSchema = SchemaFactory.createForClass(UserDocument);

// Safe DTO for API exposure
export class SafeUserDocumentDto {
  _id: string;
  docType: string;
  fileUrl: string;
  user: string; // expose only userId, or populate later if needed
}
