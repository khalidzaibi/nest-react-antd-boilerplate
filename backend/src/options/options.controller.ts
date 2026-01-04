import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Req,
  BadRequestException,
  Patch,
  Param,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { OptionsService } from "./options.service";
import { SafeOptionDto, OptionsFormDto } from "./dto/options.dto";
import { ApiResponse } from "../utils/responseHelper";
import { successResponse } from "../utils/responseHelper";
import { Permissions } from "../common/decorators/permissions.decorator";

@Controller("options")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get()
  // @Permissions("options.read")
  async getOptions(@Req() req: any): Promise<{
    data: SafeOptionDto[];
    pagination?: {};
  }> {
    try {
      return await this.optionsService.findAll(req);
    } catch (error) {
      console.error("Error fetching options:", error);
      throw new BadRequestException("Failed to fetch options");
    }
  }
  @Post("get-options-with-provided-types")
  // @Permissions("options.read")
  async getOptionsWithProvidedTypes(
    @Body() body: any,
    @Req() req: any
  ): Promise<any> {
    try {
      return await this.optionsService.getOptionsWithProvidedTypes(body, req);
    } catch (error) {
      console.error("Error fetching options:", error);
      throw new BadRequestException("Failed to fetch options");
    }
  }

  @Post()
  @Permissions("options.create")
  async create(
    @Body() dto: OptionsFormDto,
    @Req() req: any
  ): Promise<ApiResponse<SafeOptionDto>> {
    try {
      const option = await this.optionsService.saveOption(dto, req);
      return successResponse(option, "Option created successfully", 201);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Patch(":id")
  @Permissions("options.update")
  async update(
    @Param("id") id: string,
    @Body() dto: OptionsFormDto,
    @Req() req: any
  ): Promise<ApiResponse<SafeOptionDto>> {
    try {
      const option = await this.optionsService.updateOption(id, dto, req);
      return successResponse(option, "Option updated successfully", 200);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
