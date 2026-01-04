import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import * as mongoose from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type UserPreferenceDocument = HydratedDocument<UserPreference>;

@Schema({
  collection: "user_preferences",
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
})
export class UserPreference {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, unique: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  lastMenu?: string | null;

  @Prop({ type: [mongoose.Schema.Types.Mixed], default: [] })
  tags: Record<string, any>[];
}

export const UserPreferenceSchema = SchemaFactory.createForClass(
  UserPreference
);
