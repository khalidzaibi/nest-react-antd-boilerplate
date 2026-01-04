import {
  Body,
  Req,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import { CreateRoleDto, UpdateRoleDto } from "./dto/roles.dto";
import { RolesService } from "./roles.service";
import { successResponse, errorResponse } from "../utils/responseHelper";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Permissions } from "../common/decorators/permissions.decorator";

@Controller("roles")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Get()
  // @Permissions("roles.read")
  list(@Req() req: any) {
    return this.roleService.findAll(req);
  }

  @Post()
  @Permissions("roles.create")
  async create(@Req() req: any, @Body() dto: CreateRoleDto) {
    const userId = req.user?.userId;
    const role = await this.roleService.createRole(dto, userId); // <-- await
    return successResponse(role, "Role created successfully", 201);
  }

  @Patch(":id")
  @Permissions("roles.update")
  async update(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: UpdateRoleDto
  ) {
    const userId = req.user?.userId;
    await this.roleService.updateRole(id, dto, userId);
    return successResponse(null, "Role updated successfully", 200);
  }

  @Delete(":id")
  @Permissions("roles.delete")
  async remove(@Param("id") id: string) {
    await this.roleService.deleteRole(id);
    return successResponse(null, "Role deleted successfully", 200);
  }

  //   @Post(":id/permissions")
  //   assign(@Param("id") id: string, @Body() dto: AssignPermissionsDto) {
  //     return this.rbac.assignPermissions(id, dto.permissions);
  //   }

  //   @Delete(":id/permissions/:key")
  //   revoke(@Param("id") id: string, @Param("key") key: string) {
  //     return this.rbac.revokePermission(id, key);
  //   }
}
