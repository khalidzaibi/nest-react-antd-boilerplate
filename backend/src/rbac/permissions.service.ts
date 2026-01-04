import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Permission, PermissionDocument } from "./schema/permission.schema";
import { Role, RoleDocument } from "./schema/role.schema";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  SafePermissionDto,
} from "./dto/permissions.dto";
import { runAggregation } from "../utils/runAggregation";
import { buildDynamicPipeline } from "../utils/parseFilters";
import {
  toSafePermissionDto,
  groupPermissionsByModule,
} from "./mappers/permissions.mapper";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permModel: Model<PermissionDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>
  ) {}

  // ------- CREATE -------
  async createPermission(dto: CreatePermissionDto, actorId: string) {
    const key = dto.key.toLowerCase().trim();
    try {
      return await this.permModel.create({
        key,
        label: dto.label,
        description: dto.description,
        createdBy: new Types.ObjectId(actorId),
      });
    } catch (e: any) {
      if (e?.code === 11000)
        throw new BadRequestException("Permission already exists");
      throw e;
    }
  }

  // ------- UPDATE -------
  async updatePermission(
    id: string,
    dto: UpdatePermissionDto,
    actorId: string
  ) {
    const doc = await this.permModel.findById(id);
    if (!doc) throw new NotFoundException("Permission not found");

    if (dto.label !== undefined) doc.label = dto.label;
    if (dto.description !== undefined) doc.description = dto.description;
    doc.updatedBy = new Types.ObjectId(actorId);

    await doc.save();
    return doc.toObject();
  }

  // ------- LIST (paginated like Options) -------
  async findAll(
    req: any
  ): Promise<{ data: SafePermissionDto[]; pagination?: {} }> {
    const { page, perPage, filters, sorting, module } = req.query || {};
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
      searchableFields: ["key", "label", "description"],
      filters: parsedFilters,
      sorting: parsedSorting,
      populates: commonPopulates,
    });

    if (pageNum && perPageNum) {
      return await runAggregation<PermissionDocument>(
        this.permModel,
        pipeline,
        toSafePermissionDto,
        pageNum,
        perPageNum
      );
    }
    return await runAggregation<PermissionDocument>(
      this.permModel,
      pipeline,
      toSafePermissionDto
    );
  }

  // ------- DELETE -------
  async deletePermissionById(id: string) {
    const perm = await this.permModel.findById(id);
    if (!perm) throw new NotFoundException("Permission not found");

    const rolesByKey = await this.roleModel
      .find({ permissions: perm.key }) // roles store keys: ['users.read', ...]
      .select("name")
      .lean();
    const usedByNames = Array.from(
      new Set<string>([...rolesByKey].map((r) => r.name))
    );
    if (usedByNames.length > 0) {
      throw new BadRequestException(
        `Permission is used by roles: ${usedByNames.join(
          ", "
        )}. Remove it from those roles before deleting.`
      );
    }

    await this.permModel.deleteOne({ _id: id });
    return { deleted: true };
  }

  async getAllPermissionsGrouped() {
    const docs = await this.permModel
      .find({}, { key: 1, label: 1, description: 1 }) // projection
      .lean();

    return groupPermissionsByModule(docs);
  }
}
