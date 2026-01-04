import { Types } from "mongoose";
import * as bcrypt from "bcrypt";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../../users/schemas/user.schema";
import { Role } from "../../rbac/schema/role.schema";

export class UsersSeeder {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>
  ) {}
  async seedAdmin() {
    const email = "admin@example.com";
    const existing = await this.userModel.findOne({ email });

    // Fetch first 2 roles
    const roles = await this.roleModel.find().sort({ createdAt: 1 });
    const roleIds = roles.map((r) => r._id);

    if (existing) {
      existing.roles = roleIds;
      await existing.save();
      return existing._id;
    }

    const passwordHash = await bcrypt.hash("Admin@123", 10);
    const admin = await this.userModel.create({
      email,
      passwordHash,
      name: "Admin",
      roles: roleIds,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new Types.ObjectId(),
    });

    console.log("Seeded user -> email:", email, "| password: Admin@123");
    return admin._id;
  }
}
