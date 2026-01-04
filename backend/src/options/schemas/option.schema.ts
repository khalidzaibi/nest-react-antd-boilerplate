import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import * as mongoose from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type OptionDocument = HydratedDocument<Option>;

@Schema({
  timestamps: true,
  strict: true,
  toJSON: { virtuals: true, versionKey: false },
})
export class Option {
  _id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId | User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", default: null })
  updatedBy: Types.ObjectId | User | null;

  @Prop({ trim: true })
  name?: string;

  @Prop({ trim: true })
  type?: string;

  @Prop({ type: Number, enum: [0, 1], default: 1 })
  status: number;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", default: null })
  deletedBy?: Types.ObjectId | User | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
OptionSchema.index({ type: 1, name: 1 });
OptionSchema.index({ status: 1 });
OptionSchema.index({ createdBy: 1 });
OptionSchema.index({ updatedBy: 1 });
OptionSchema.index({ createdAt: -1 });
OptionSchema.index({ updatedAt: -1 });
OptionSchema.index({ deletedAt: 1 });
