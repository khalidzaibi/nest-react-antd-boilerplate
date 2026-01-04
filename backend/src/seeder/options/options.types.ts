import { Types } from "mongoose";

export type OptionType =
  | "user-designations";

export interface OptionDoc {
  name: string;
  type: OptionType;
  status: number;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
