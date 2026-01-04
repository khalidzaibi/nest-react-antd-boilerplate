import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ROLE_SEED } from "./roles.data";
import { labelFromKey, toFlatKeys } from "./perm-helpers";
import { Permission, PermissionDocument } from "../../rbac/schema/permission.schema";
import { Role, RoleDocument } from "../../rbac/schema/role.schema";

@Injectable()
export class RoleSeeder {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name)
    private readonly permModel: Model<PermissionDocument>
  ) {}

  async seed() {
    const now = new Date();

    // 1️⃣ Normalize roles into { name, keys[] }
    const roles = ROLE_SEED.map(toFlatKeys);

    // 2️⃣ Collect unique permission keys
    const allKeys = Array.from(new Set(roles.flatMap((r) => r.keys)));

    // 3️⃣ Upsert permissions
    if (allKeys.length) {
      const permOps = allKeys.map((key) => ({
        updateOne: {
          filter: { key },
          update: {
            $setOnInsert: { key, label: labelFromKey(key), createdAt: now },
            $set: { updatedAt: now },
          },
          upsert: true,
        },
      }));

      await this.permModel.bulkWrite(permOps, { ordered: false });
      console.log(`✅ Permissions ensured: ${allKeys.length}`);
    }

    // 4️⃣ Upsert roles and add permissions (without duplicates)
    if (roles.length) {
      const roleOps = roles.map((r) => ({
        updateOne: {
          filter: { name: r.name.trim().toLowerCase() },
          update: {
            $setOnInsert: {
              name: r.name.trim().toLowerCase(),
              createdAt: now,
            },
            $addToSet: {
              permissions: { $each: r.keys },
            },
            $set: { updatedAt: now },
          },
          upsert: true,
        },
      }));

      await this.roleModel.bulkWrite(roleOps, { ordered: false });
      console.log(`✅ Roles ensured: ${roles.length}`);
    }
  }
}
