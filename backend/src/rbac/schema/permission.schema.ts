import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";
import { buildLabelFromKey } from "../../utils/helpers";

export type PermissionDocument = HydratedDocument<Permission>;
const norm = (s: string) => (s ?? "").toString().trim().toLowerCase();

@Schema({
  collection: "permissions",
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true, versionKey: false },
  versionKey: false,
})
export class Permission {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+(\.[a-z0-9-]+)+$/,
    set: (v: string) => norm(v),
  })
  key: string; // e.g. "users.read"

  @Prop({ trim: true })
  label?: string; // e.g. "Read Users"

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  deletedBy?: Types.ObjectId | null;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// indexes
PermissionSchema.index({ key: 1 }, { unique: true });
PermissionSchema.index({ label: 1 });
PermissionSchema.index({ deletedAt: 1 });

// optional: default label from key if not provided
PermissionSchema.pre("save", function (next) {
  if (!this.label && this.key) {
    this.label = buildLabelFromKey(this.key);
  }
  next();
});
