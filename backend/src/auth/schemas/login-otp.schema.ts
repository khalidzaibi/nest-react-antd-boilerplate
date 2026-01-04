import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as mongoose from "mongoose";

export type LoginOtpDocument = HydratedDocument<LoginOtp>;

@Schema({
  collection: "login_otps",
  timestamps: true,
})
export class LoginOtp {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  codeHash: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Number, default: 0 })
  attempts?: number;
}

export const LoginOtpSchema = SchemaFactory.createForClass(LoginOtp);
LoginOtpSchema.index({ user: 1 });
LoginOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
