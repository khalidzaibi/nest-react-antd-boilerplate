import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import * as mongoose from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type PasswordResetTokenDocument =
  HydratedDocument<PasswordResetToken>;

@Schema({
  collection: "user_password_reset_tokens",
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
})
export class PasswordResetToken {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  token: string;

  // Mongoose TTL index; documents auto-delete after `expiresAt`.
  @Prop({ type: Date, required: true, expires: 0 })
  expiresAt: Date;
}

export const PasswordResetTokenSchema = SchemaFactory.createForClass(
  PasswordResetToken
);
