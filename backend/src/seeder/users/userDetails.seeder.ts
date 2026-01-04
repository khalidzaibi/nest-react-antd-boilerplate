import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  UserDetails,
  UserDetailsDocument,
} from "../../users/schemas/user-details.schema";

@Injectable()
export class UserDetailsSeeder {
  constructor(
    @InjectModel(UserDetails.name)
    private readonly userDetailsModel: Model<UserDetailsDocument>
  ) {}

  async seed(userId: Types.ObjectId) {
    const existing = await this.userDetailsModel.findOne({ user: userId });
    if (existing) return;

    await this.userDetailsModel.create({
      user: userId,
      address: "Dubai Marina",
      phone: "+9715000000",
      dob: new Date("1990-01-01"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Seeded user_details for user:", userId.toHexString());
  }
}
