import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import * as bcrypt from "bcrypt";
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UpdateUserPasswordDto,
  UpdateProfileDto,
} from "./dto/user.dto";
import { toSafeUserDto } from "./mappers/users.mapper";
import {
  UserAccessToken,
  UserAccessTokenDocument,
} from "./schemas/user-access-token.schema";
import { Types } from "mongoose";
import { runAggregation } from "../utils/runAggregation";
import { buildDynamicPipeline } from "../utils/parseFilters";
import { PermissionsCacheService } from "../common/services/permissions-cache.service";
type RolePermissions = {
  rolesName: string[];
  permissions: string[];
  modules: string[];
};
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserAccessToken.name)
    private userAccessTokenModel: Model<UserAccessTokenDocument>,
    private readonly permissionsCache: PermissionsCacheService
  ) {}

  private normalizePermissions(perms?: string[] | null): string[] {
    if (!Array.isArray(perms)) return [];
    const unique = new Set<string>();
    for (const perm of perms) {
      if (typeof perm !== "string") continue;
      const normalized = perm.trim().toLowerCase();
      if (!normalized) continue;
      unique.add(normalized);
    }
    return Array.from(unique);
  }

  private normalizeRoleNames(input: unknown): string[] {
    const values = Array.isArray(input)
      ? input
      : typeof input === "string"
      ? input.split(",")
      : [];

    const unique = new Set<string>();
    for (const value of values) {
      if (typeof value !== "string") continue;
      const normalized = value.trim().toLowerCase();
      if (normalized) {
        unique.add(normalized);
      }
    }

    return Array.from(unique);
  }

  private normalizeDesignationNames(input: unknown): string[] {
    const values = Array.isArray(input)
      ? input
      : typeof input === "string"
      ? input.split(",")
      : [];

    const unique = new Set<string>();
    for (const value of values) {
      if (typeof value !== "string") continue;
      const normalized = value.trim();
      if (normalized) {
        unique.add(normalized);
      }
    }

    return Array.from(unique);
  }

  private normalizeObjectIds(input: unknown): any {
    const values = Array.isArray(input) ? input : input ? [input] : [];
    const inValues: any[] = [];
    for (const val of values) {
      if (typeof val === "string" && Types.ObjectId.isValid(val)) {
        inValues.push(new Types.ObjectId(val));
        inValues.push(val); // also allow stored as string
      } else if (val !== undefined && val !== null) {
        inValues.push(val);
      }
    }
    return inValues.length > 0 ? { $in: inValues } : null;
  }

  private normalizeRoleIds(input: unknown): any {
    const values = Array.isArray(input) ? input : input ? [input] : [];
    const inValues: any[] = [];
    for (const val of values) {
      if (typeof val === "string" && Types.ObjectId.isValid(val)) {
        inValues.push(new Types.ObjectId(val));
      }
    }
    return inValues.length > 0 ? { $in: inValues } : null;
  }

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private normalizeStatusFilter(
    input: unknown
  ): boolean | { $in: boolean[] } | undefined {
    if (input === undefined) return undefined;
    const parseBool = (val: any): boolean | null => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") {
        const lower = val.trim().toLowerCase();
        if (["true", "1", "yes", "y"].includes(lower)) return true;
        if (["false", "0", "no", "n"].includes(lower)) return false;
      }
      return null;
    };

    if (Array.isArray(input)) {
      const bools = Array.from(
        new Set(
          input
            .map((v) => parseBool(v))
            .filter((v): v is boolean => v !== null)
        )
      );
      if (bools.length === 0) return undefined;
      if (bools.length === 1) return bools[0];
      return { $in: bools };
    }

    const single = parseBool(input);
    return single === null ? undefined : single;
  }

  // Return safe users only (no passwordHash)
  async findAll(req: any): Promise<{ data: UserDto[]; pagination?: any }> {
    const { page, perPage, filters, sorting } = req.query || {};

    const parsedFilters =
      typeof filters === "string" ? JSON.parse(filters) : filters;
    const processedFilters = { ...(parsedFilters || {}) };
    const parsedSorting =
      typeof sorting === "string" ? JSON.parse(sorting) : sorting;

    const pageNum = Number(page);
    const perPageNum = Number(perPage);
    const commonPopulates = [
      { path: "createdBy", select: "name email", collectionName: "users" },
      { path: "updatedBy", select: "name email", collectionName: "users" },
      {
        path: "rolesData",
        select: "name _id",
        collectionName: "roles",
        localField: "roles",
        foreignField: "_id",
        isArray: true,
      }, // <-- virtual populate
      {
        path: "designationData",
        select: "name _id",
        collectionName: "options",
        localField: "designation",
        foreignField: "_id",
        isArray: false,
      },
    ];

    // const roleNames = this.normalizeRoleNames(
    //   processedFilters.roles ?? processedFilters["rolesData.name"]
    // );
    // if (roleNames.length > 0) {
    //   delete processedFilters.roles; // avoid trying to match against ObjectId array
    //   delete processedFilters["rolesData.name"]; // prevent regex handling on string
    //   processedFilters["rolesData.name"] = { $in: roleNames };
    // }

    const roleIdFilter = this.normalizeRoleIds(processedFilters.roles);
    if (roleIdFilter) {
      processedFilters.roles = roleIdFilter;
    } else {
      delete processedFilters.roles;
    }

    const normalizedStatus = this.normalizeStatusFilter(processedFilters.status);
    if (normalizedStatus !== undefined) {
      processedFilters.status = normalizedStatus;
    } else {
      delete processedFilters.status;
    }

    const designationIdFilter = this.normalizeObjectIds(
      processedFilters.designations
    );
    if (designationIdFilter) {
      processedFilters.designation = designationIdFilter;
    }
    delete processedFilters.designations;

    const designationNames = this.normalizeDesignationNames(
      processedFilters.designationNames ?? processedFilters.designation
    );
    if (designationNames.length > 0) {
      processedFilters["designationData.name"] = {
        $in: designationNames.map(
          (name) => new RegExp(`^${this.escapeRegex(name)}$`, "i")
        ),
      };
      processedFilters["designationData.type"] = "user-designations";
    }
    delete processedFilters.designationNames;

    const pipeline = buildDynamicPipeline({
      searchableFields: ["name", "email", "status"],
      filters: processedFilters,
      sorting: parsedSorting,
      populates: commonPopulates,
    });

    if (pageNum && perPageNum) {
      return await runAggregation<UserDocument>(
        this.userModel,
        pipeline,
        toSafeUserDto,
        pageNum,
        perPageNum
      );
    }
    return await runAggregation<UserDocument>(
      this.userModel,
      pipeline,
      toSafeUserDto
    );
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.userModel
      .findOne({ email })
      .populate([
        { path: "designationData", select: "name _id" },
        // { path: "rolesData", select: "name _id permissions" },
      ])
      .exec();
  }

  async findById(id: string): Promise<any | null> {
    return this.userModel
      .findById(id)
      .select("-passwordHash")
      .populate([
        { path: "designationData", select: "name _id" },
        { path: "rolesData", select: "name _id permissions" },
        { path: "createdBy", select: "name email" },
        { path: "updatedBy", select: "name email" },
      ])
      .lean()
      .exec();
  }

  async createUser(dto: CreateUserDto, actorId: string): Promise<any> {
    if (dto.email) {
      const existing = await this.userModel.findOne({
        email: dto.email.toLowerCase().trim(),
      });
      if (existing) {
        throw new BadRequestException("Email already in use");
      }
    }
    const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);

    let designationId: Types.ObjectId | null = null;
    if (dto.designation) {
      if (!Types.ObjectId.isValid(dto.designation)) {
        throw new BadRequestException("Invalid designation");
      }
      designationId = new Types.ObjectId(dto.designation);
    }

    const specialPermissions = this.normalizePermissions(
      dto.specialPermissions ?? null
    );

    const newUser = await this.userModel.create({
      email: dto.email,
      name: dto.name,
      passwordHash: hashedPassword,
      roles: (dto.roles || []).map((roleId) => new Types.ObjectId(roleId)),
      designation: designationId,
      specialPermissions,
      createdBy: actorId,
    });
    return this.findById(newUser._id);
  }
  async updateUser(id: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException("User not found");

    if (dto.email) {
      const existing = await this.userModel.findOne({
        email: dto.email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new BadRequestException("Email already in use");
      }
    }

    const update: Partial<User> = {};

    if (dto.name !== undefined) update.name = dto.name;
    if (dto.email !== undefined) update.email = dto.email.toLowerCase().trim();
    // if (dto.passwordHash)
    //   update.passwordHash = await bcrypt.hash(dto.passwordHash, 10);
    if (dto.roles !== undefined)
      update.roles = dto.roles.map((r) => new Types.ObjectId(r)) as any;

    if (dto.designation !== undefined) {
      if (!dto.designation) {
        update.designation = null;
      } else {
        if (!Types.ObjectId.isValid(dto.designation)) {
          throw new BadRequestException("Invalid designation");
        }
        update.designation = new Types.ObjectId(dto.designation) as any;
      }
    }

    if (dto.specialPermissions !== undefined) {
      update.specialPermissions = this.normalizePermissions(
        dto.specialPermissions
      );
    }

    update.status = dto.status !== undefined ? dto.status : user.status;
    update.updatedBy = new Types.ObjectId(actorId);
    await this.userModel.updateOne({ _id: id }, { $set: update }).exec();
    this.permissionsCache.invalidate(id);
    return this.findById(id);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto
  ): Promise<any | null> {
    const update: Partial<User> = {};
    if (dto.name !== undefined) update.name = dto.name;

    if (dto.designation !== undefined) {
      if (!dto.designation) {
        update.designation = null;
      } else {
        if (!Types.ObjectId.isValid(dto.designation)) {
          throw new BadRequestException("Invalid designation");
        }
        update.designation = new Types.ObjectId(dto.designation) as any;
      }
    }

    if (dto.avatar !== undefined) {
      update.avatar = dto.avatar || null;
    }

    if (Object.keys(update).length === 0) {
      return this.findById(userId);
    }

    await this.userModel.updateOne({ _id: userId }, { $set: update }).exec();
    this.permissionsCache.invalidate(userId);
    return this.findById(userId);
  }

  async updateUserPassword(
    id: string,
    dto: UpdateUserPasswordDto,
    actorId: string
  ) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException("User not found");

    const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);

    const update: Partial<User> = {
      passwordHash: hashedPassword,
      isPasswordChanged: true,
    };

    if (actorId) {
      update.updatedBy = new Types.ObjectId(actorId);
    }

    await this.userModel.updateOne({ _id: id }, { $set: update }).exec();
    this.permissionsCache.invalidate(id);
    return this.findById(id);
  }

  async getUserPermissions(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select("roles specialPermissions")
      .populate({
        path: "roles",
        select: "permissions",
      })
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const rolePermissionsSet = new Set<string>();
    const roles = Array.isArray(user.roles) ? user.roles : [];
    for (const role of roles as any[]) {
      const perms = role?.permissions ?? [];
      perms.forEach((perm: string) => {
        if (typeof perm === "string" && perm.trim()) {
          rolePermissionsSet.add(perm.trim());
        }
      });
    }

    const rolePermissions = Array.from(rolePermissionsSet).sort();
    const specialPermissions = this.normalizePermissions(
      user.specialPermissions as string[]
    );

    return {
      rolePermissions,
      specialPermissions,
    };
  }

  async updateSpecialPermissions(userId: string, permissions: string[]) {
    const user = await this.userModel.findById(userId).select("_id").exec();
    if (!user) throw new NotFoundException("User not found");

    const normalized = this.normalizePermissions(permissions);

    await this.userModel
      .updateOne({ _id: userId }, { $set: { specialPermissions: normalized } })
      .exec();

    this.permissionsCache.invalidate(userId);

    return {
      specialPermissions: normalized,
    };
  }

  async updateToken(userId: string, rawToken: string) {
    const hashedToken = await bcrypt.hash(rawToken, 10);
    await this.userAccessTokenModel.create({
      user: userId,
      token: hashedToken,
    });
  }

  async removeToken(userId: string, rawToken: string) {
    const entry = await this.findAccessTokenEntry(userId, rawToken);
    if (entry) {
      await this.userAccessTokenModel.deleteOne({ _id: entry._id }).exec();
    }
  }

  async findAccessTokenEntry(userId: string, rawToken: string) {
    const tokens = await this.userAccessTokenModel
      .find({ user: userId, revoked: false })
      .exec();

    for (const tokenDoc of tokens) {
      const matches = await bcrypt.compare(rawToken, tokenDoc.token);
      if (matches) {
        return tokenDoc;
      }
    }
    return null;
  }

  async rolePermissions(userId: string): Promise<RolePermissions> {
    const userDoc = await this.userModel
      .findById(userId)
      .populate("rolesData", "name permissions")
      .lean()
      .exec();

    if (!userDoc) {
      return { rolesName: [], permissions: [], modules: [] };
    }

    const rolesData = Array.isArray(userDoc.rolesData) ? userDoc.rolesData : [];
    const rolesName = rolesData.map((r: any) => String(r.name).trim());

    const permSet = new Set<string>();
    for (const r of rolesData)
      for (const p of r.permissions || []) permSet.add(String(p).trim());
    const specialPermissions = this.normalizePermissions(
      userDoc.specialPermissions as string[]
    );
    for (const perm of specialPermissions) permSet.add(perm);
    const permissions = Array.from(permSet).sort();

    const modules = Array.from(
      new Set(permissions.map((p) => p.split(".")[0]).filter(Boolean))
    ).sort();

    return { rolesName, permissions, modules };
  }
}
