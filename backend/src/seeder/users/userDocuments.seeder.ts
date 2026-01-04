import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { UserDocument } from "../../users/schemas/user-document.schema"; // if you have it
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserDocumentsSeeder {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userDocumentsModel: Model<UserDocument>
  ) {}

  async seed(userId: Types.ObjectId) {
    const existing = await this.userDocumentsModel.findOne({ user: userId });
    if (existing) return;

    await this.userDocumentsModel.insertMany([
      {
        user: userId,
        docType: "Passport",
        fileUrl: "https://fakeurl.com/uploads/passport.pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user: userId,
        docType: "Visa",
        fileUrl: "https://fakeurl.com/uploads/visa.pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log("✅ Seeded user_documents for user:", userId.toHexString());
  }
}
