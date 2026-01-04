import {
  Body,
  Req,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from "./dto/permissions.dto";
import { successResponse } from "../utils/responseHelper";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Permissions } from "../common/decorators/permissions.decorator";

@Controller("permissions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PermissionsController {
  constructor(private readonly permService: PermissionsService) {}

  @Get()
  // @Permissions("permissions.read")
  list(@Req() req: any) {
    return this.permService.findAll(req);
  }
  @Post()
  @Permissions("permissions.create")
  async create(@Req() req: any, @Body() dto: CreatePermissionDto) {
    const actorId = req.user.userId;
    await this.permService.createPermission(dto, actorId);
    return successResponse(null, "Permission created successfully", 201);
  }
  @Patch(":id")
  @Permissions("permissions.update")
  async update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdatePermissionDto
  ) {
    const actorId = req.user.userId;
    await this.permService.updatePermission(id, dto, actorId);
    return successResponse(null, "Permission updated successfully", 200);
  }

  @Delete(":id")
  @Permissions("permissions.delete")
  async remove(@Param("id") id: string) {
    await this.permService.deletePermissionById(id);
    return successResponse(null, "Permission deleted successfully", 200);
  }

  // getAllPermissionsGrouped
  @Get("grouped")
  // @Permissions("permissions.read")
  async getAllPermissionsGrouped() {
    return this.permService.getAllPermissionsGrouped();
  }
}
