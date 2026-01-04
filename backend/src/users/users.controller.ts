import {
  Controller,
  Get,
  Patch,
  Param,
  Post,
  UseGuards,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { successResponse, errorResponse } from "../utils/responseHelper";
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from "./dto/user.dto";
import {
  Permissions,
  RequireAllPermissions,
  RequireAnyPermissions,
} from "../common/decorators/permissions.decorator";
import { UsersImportService } from "./users-import.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import * as path from "path";
import * as fs from "fs";

// @RequireAllPermissions("users.update")
// @RequireAnyPermissions("users.manage", "admins.manage")

@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersImportService: UsersImportService
  ) {}

  @Get()
  // @Permissions("users.read")
  async getUsers(@Req() req: any) {
    return this.usersService.findAll(req);
  }
  @Post()
  @Permissions("users.create")
  async create(@Req() req: any, @Body() dto: CreateUserDto) {
    const userId = req.user?.userId;
    const role = await this.usersService.createUser(dto, userId);
    return successResponse(role, "Role created successfully", 201);
  }

  @Patch(":id")
  @Permissions("users.update")
  async update(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: UpdateUserDto
  ) {
    const userId = req.user?.userId;
    await this.usersService.updateUser(id, dto, userId);
    return successResponse(null, "Role updated successfully", 200);
  }

  @Patch(":id/password")
  @Permissions("users.update-password")
  async updatePassword(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: UpdateUserPasswordDto
  ) {
    const userId = req.user?.userId;
    await this.usersService.updateUserPassword(id, dto, userId);
    return successResponse(null, "Password updated successfully", 200);
  }

  @Get(":id/permissions")
  @RequireAllPermissions("users.manage-special-permissions")
  async getPermissions(@Param("id") id: string) {
    const { rolePermissions, specialPermissions } =
      await this.usersService.getUserPermissions(id);

    return {
      rolePermissions,
      specialPermissions,
    };
  }

  @Patch(":id/permissions/special")
  @RequireAnyPermissions("users.manage-special-permissions")
  async updateSpecialPermissions(
    @Param("id") id: string,
    @Body("specialPermissions") specialPermissions: string[]
  ) {
    const updated = await this.usersService.updateSpecialPermissions(
      id,
      specialPermissions
    );
    return successResponse(
      updated,
      "Special permissions updated successfully",
      200
    );
  }

  @Post("import")
  @Permissions("users.import")
  @UseInterceptors(FileInterceptor("file"))
  async importUsers(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    if (!file) {
      throw new BadRequestException("CSV file is required");
    }
    try {
      const result = await this.usersImportService.importFromCsv(
        file.buffer,
        req.user
      );
      return { message: "Users import processed", data: result };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Get("import/sample")
  @Permissions("users.import")
  async downloadUserImportSample(@Res() res: Response) {
    const candidatePaths = [
      path.resolve(__dirname, "samples", "user-import-sample.csv"),
      path.resolve(
        process.cwd(),
        "src",
        "users",
        "samples",
        "user-import-sample.csv"
      ),
    ];

    const existingPath = candidatePaths.find((p) => fs.existsSync(p));
    if (!existingPath) {
      throw new BadRequestException("Sample file not found");
    }

    const content = fs.readFileSync(existingPath);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="user-import-sample.csv"'
    );
    return res.send(content);
  }
}
