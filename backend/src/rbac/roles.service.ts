import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Role, RoleDocument } from "./schema/role.schema";
import { Permission, PermissionDocument } from "./schema/permission.schema";
import { User, UserDocument } from "../users/schemas/user.schema";
import { CreateRoleDto, UpdateRoleDto, SafeRoleDto } from "./dto/roles.dto";
import { runAggregation } from "../utils/runAggregation";
import { buildDynamicPipeline } from "../utils/parseFilters";
import { toSafeRoleDto } from "./mappers/roles.mapper";
import { PermissionsCacheService } from "../common/services/permissions-cache.service";

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name)
    private readonly permModel: Model<PermissionDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly permissionsCache: PermissionsCacheService
  ) {}

  // ---------- CREATE ----------
  async createRole(dto: CreateRoleDto, actorId: string) {
    const name = dto.name.toLowerCase().trim();

    // 0) Precheck uniqueness (for nicer error)
    const existsByName = await this.roleModel.exists({ name });
    if (existsByName) {
      throw new BadRequestException("Role name already exists");
    }
    // Validate provided permission KEYS (if any)
    if (dto.permissions && dto.permissions.length)
      await this.validatePermissionKeys(dto.permissions || []);

    try {
      return await this.roleModel.create({
        name,
        permissions: (dto.permissions || []).map((p) => p.toLowerCase().trim()),
        createdBy: new Types.ObjectId(actorId),
      });
    } catch (e: any) {
      if (e?.code === 11000)
        throw new BadRequestException("Role already exists");
      throw e;
    }
  }

  // validate provided permission KEYS (if any)
  protected async validatePermissionKeys(keys: string[]) {
    if (!keys || !keys.length) return;
    const lowered = keys.map((k) => k.toLowerCase().trim());
    const exists = await this.permModel.find({ key: { $in: lowered } }).lean();
    const missing = lowered.filter((k) => !exists.find((e) => e.key === k));
    if (missing.length)
      throw new BadRequestException(
        `Missing permissions: ${missing.join(", ")}`
      );
  }
  // ---------- UPDATE ----------
  async updateRole(id: string, dto: UpdateRoleDto, actorId: string) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException("Role not found");

    // Validate provided permission KEYS (if any)
    if (dto.permissions !== undefined) {
      await this.validatePermissionKeys(dto.permissions);
      role.permissions = dto.permissions.map((p) => p.toLowerCase().trim());
    }

    if (dto.name) role.name = dto.name.toLowerCase().trim();
    role.updatedBy = new Types.ObjectId(actorId);

    await role.save();

    const affectedUsers = await this.userModel
      .find({ roles: new Types.ObjectId(id) })
      .select("_id")
      .lean()
      .exec();
    for (const user of affectedUsers) {
      this.permissionsCache.invalidate(String(user._id));
    }

    return role.toObject();
  }

  // ---------- LIST (paginated like permissions/options) ----------
  async findAll(req: any): Promise<{ data: SafeRoleDto[]; pagination?: {} }> {
    const { page, perPage, filters, sorting } = req.query || {};
    const parsedFilters =
      typeof filters === "string" ? JSON.parse(filters) : filters;
    const parsedSorting =
      typeof sorting === "string" ? JSON.parse(sorting) : sorting;

    const pageNum = Number(page);
    const perPageNum = Number(perPage);
    const commonPopulates = [
      { path: "createdBy", select: "name email", collectionName: "users" },
      { path: "updatedBy", select: "name email", collectionName: "users" },
    ];

    const pipeline = buildDynamicPipeline({
      searchableFields: ["name", "permissions"],
      filters: parsedFilters,
      sorting: parsedSorting,
      populates: commonPopulates,
    });

    if (pageNum && perPageNum) {
      return await runAggregation<RoleDocument>(
        this.roleModel,
        pipeline,
        toSafeRoleDto,
        pageNum,
        perPageNum
      );
    }
    return await runAggregation<RoleDocument>(
      this.roleModel,
      pipeline,
      toSafeRoleDto
    );
  }

  // ---------- DELETE ----------
  async deleteRole(id: string) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException("Role not found");

    const userQueryById = { roles: new Types.ObjectId(id) };
    const total = await this.userModel.countDocuments(userQueryById);
    if (total > 0) {
      throw new BadRequestException(
        `Role is assigned to ${total} user${
          total === 1 ? "" : "s"
        }. Remove it from those users before deleting.`
      );
    }
    await this.roleModel.deleteOne({ _id: id });
    return { deleted: true };
  }

  // ---------- ASSIGN / REVOKE (optional helpers like before) ----------
  // async assignPermissions(roleId: string, perms: string[]) {
  //   const role = await this.roleModel.findById(roleId);
  //   if (!role) throw new NotFoundException("Role not found");

  //   const keys = perms.map((p) => p.toLowerCase().trim());
  //   const exists = await this.permModel.find({ key: { $in: keys } }).lean();
  //   const missing = keys.filter((k) => !exists.find((e) => e.key === k));
  //   if (missing.length)
  //     throw new BadRequestException(
  //       `Missing permissions: ${missing.join(", ")}`
  //     );

  //   const set = new Set([...(role.permissions || []), ...keys]);
  //   role.permissions = Array.from(set).sort();
  //   await role.save();
  //   return role.toObject();
  // }

  // async revokePermission(roleId: string, key: string) {
  //   const role = await this.roleModel.findById(roleId);
  //   if (!role) throw new NotFoundException("Role not found");

  //   const k = key.toLowerCase().trim();
  //   role.permissions = (role.permissions || []).filter((p) => p !== k);
  //   await role.save();
  //   return role.toObject();
  // }
}
