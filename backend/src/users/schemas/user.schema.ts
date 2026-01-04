import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Role } from "../../rbac/schema/role.schema";

export type UserDocument = HydratedDocument<User> & { rolesData?: Role[] };

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class User {
  _id: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Option", default: null })
  designation?: Types.ObjectId | null;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    default: [],
  })
  roles: Types.ObjectId[];

  @Prop({ trim: true, default: null })
  avatar?: string | null;

  @Prop({ type: [String], default: [] })
  specialPermissions?: string[];

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: Boolean, default: false })
  isPasswordChanged?: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  createdBy?: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", default: null })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", default: null })
  deletedBy?: Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.index({ name: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ designation: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ createdBy: 1 });
UserSchema.index({ updatedBy: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ updatedAt: -1 });
UserSchema.index({ deletedAt: 1 });

// Virtual populate: link to user_details
UserSchema.virtual("detail", {
  ref: "UserDetails",
  localField: "_id",
  foreignField: "user",
  justOne: true, // one-to-one
});

// Virtual populate: link to user_documents
UserSchema.virtual("documents", {
  ref: "UserDocument",
  localField: "_id",
  foreignField: "user",
});

// Virtual populate: link to user_access_tokens
UserSchema.virtual("accessTokens", {
  ref: "UserAccessToken",
  localField: "_id",
  foreignField: "user",
});

UserSchema.virtual("rolesData", {
  ref: "Role",
  localField: "roles",
  foreignField: "_id",
  justOne: false,
});

UserSchema.virtual("designationData", {
  ref: "Option",
  localField: "designation",
  foreignField: "_id",
  justOne: true,
});

// Hide passwordHash when serialized
(UserSchema as any).methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.passwordHash;
  return obj;
};
