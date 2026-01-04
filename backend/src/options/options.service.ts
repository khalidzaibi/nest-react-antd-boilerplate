import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Option, OptionDocument } from "./schemas/option.schema";
import { OptionsFormDto, SafeOptionDto } from "./dto/options.dto";
import { runAggregation } from "../utils/runAggregation";
import { buildDynamicPipeline } from "../utils/parseFilters";
import { toSafeOptionDto } from "./mappers/options.mappers";

@Injectable()
export class OptionsService {
  constructor(
    @InjectModel(Option.name) private optionModel: Model<OptionDocument>
  ) {}

  // ----------------------
  // Return all options
  // ----------------------
  async findAll(req: any): Promise<{
    data: SafeOptionDto[];
    pagination?: {};
  }> {
    const { page, perPage, filters, sorting } = req.query || {};

    const parsedFilters =
      typeof filters === "string" ? JSON.parse(filters) : filters;
    const parsedSorting =
      typeof sorting === "string" ? JSON.parse(sorting) : sorting;

    const pageNum = Number(page);
    const perPageNum = Number(perPage);

    const commonPopulates = [
      { path: "createdBy", select: "name", collectionName: "users" },
      { path: "updatedBy", select: "name", collectionName: "users" },
    ];

    const pipeline = buildDynamicPipeline({
      searchableFields: ["name", "type", "status"],
      filters: parsedFilters,
      sorting: parsedSorting,
      populates: commonPopulates,
    });
    if (pageNum && perPageNum) {
      return await runAggregation<Option>(
        this.optionModel,
        pipeline,
        toSafeOptionDto,
        pageNum,
        perPageNum
      );
    }
    return await runAggregation<Option>(
      this.optionModel,
      pipeline,
      toSafeOptionDto
    );
  }

  // ----------------------
  // Return single option by ID
  // ----------------------
  async findById(id: string): Promise<SafeOptionDto> {
    const option = await this.optionModel.findById(id).populate("user").exec();
    if (!option) {
      throw new NotFoundException("option not found");
    }
    return toSafeOptionDto(option as any);
  }

  // ----------------------
  // Create new option
  // ----------------------
  async saveOption(dto: OptionsFormDto, req: any): Promise<SafeOptionDto> {
    const userId = req.user.userId;

    // Create and save contact
    const option = new this.optionModel({
      ...dto,
      createdBy: userId,
    });
    const saved = await option.save();

    // Return safe DTO
    return toSafeOptionDto(saved as any);
  }

  async updateOption(
    id: string,
    dto: OptionsFormDto,
    req: any
  ): Promise<SafeOptionDto> {
    const existing = await this.optionModel.findById(id);
    if (!existing) {
      throw new NotFoundException("option not found");
    }

    const payload: Record<string, any> = {};
    Object.keys(dto || {}).forEach((key) => {
      const value = (dto as Record<string, any>)[key];
      if (value !== undefined) {
        payload[key] = value;
      }
    });
    payload.updatedBy = req.user?.userId;

    const updated = await this.optionModel
      .findByIdAndUpdate(id, { $set: payload }, { new: true })
      .exec();

    return toSafeOptionDto(updated as any);
  }

  async getOptionsWithProvidedTypes(body: any, req: any): Promise<any> {
    try {
      // extract types from body
      const { types } = body;

      // query all matching types in one go
      const options = await this.optionModel
        .find({ type: { $in: types }, status: 1 })
        .lean();
      const grouped = options.reduce((acc, o) => {
        if (!acc[o.type]) acc[o.type] = [];
        acc[o.type].push({
          // id: o._id,
          // name: o.name,
          label: o.name,
          value: o._id.toString(),
          status: o.status,
        });
        return acc;
      }, {} as Record<string, any[]>);

      // build response object
      const data: Record<string, any[]> = {};
      types.forEach((type: any) => {
        data[type] = grouped[type] || [];
      });

      return { data };
    } catch (error) {
      console.error("Error fetching options:", error);
      throw new BadRequestException("Failed to fetch options");
    }
  }
}
