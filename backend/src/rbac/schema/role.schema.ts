import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type RoleDocument = HydratedDocument<Role>;
function norm(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
}
@Schema({
  collection: "roles",
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true, versionKey: false },
  versionKey: false,
})
export class Role {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    set: (v: string) => norm(v),
  })
  name: string; // 'admin', 'manager', 'staff'

  // If you still store permission KEYS on the role:
  @Prop({
    type: [String],
    default: [],
    set: (arr: string[]) => Array.from(new Set((arr || []).map(norm))).sort(),
  })
  permissions: string[];

  @Prop({ type: Types.ObjectId, ref: User.name })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  deletedBy?: Types.ObjectId | null;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ deletedAt: 1 });
