import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import * as mongoose from "mongoose";
// import { User } from "../../users/schemas/user.schema";

export type FileDocument = HydratedDocument<File>;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false } })
export class File {
  _id: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  filename: string;

  @Prop()
  mimeType: string;

  @Prop()
  size: number;

  @Prop({ required: true })
  path: string; // filesystem or public URL

  // NEW: where this file “belongs” conceptually (bucket/folder/category)
  @Prop({ required: true })
  collectionType: string; // e.g. "accounts", "invoices", "attachments"

  // Polymorphic owner
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  modelId: Types.ObjectId;

  @Prop({ required: true })
  modelType: string; // e.g. "Account", "Contact", "Invoice"

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", default: null })
  updatedBy: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", default: null })
  deletedBy?: Types.ObjectId | null;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
FileSchema.index({ modelType: 1, modelId: 1, collectionType: 1 });
FileSchema.index({ createdBy: 1 });
FileSchema.index({ updatedBy: 1 });
FileSchema.index({ createdAt: -1 });
FileSchema.index({ updatedAt: -1 });
FileSchema.index({ deletedAt: 1 });
