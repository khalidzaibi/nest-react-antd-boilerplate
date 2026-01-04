// files.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, isValidObjectId } from "mongoose";
import { File as FileEntity, FileDocument } from "./schemas/file.schema";
import { CreateFileDto } from "./dto/create-file.dto";
import { FileStorageService } from "./file-storage.service";
import { FileResponseDto } from "./dto/file-response.dto";
import { toFileResponseDto } from "./mappers/file.mapper";
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import * as path from "path";
import { slugify } from "../utils/helpers";

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FileEntity.name)
    private readonly fileModel: Model<FileDocument>,
    private readonly storage: FileStorageService
  ) {}

  async ensureDir(dir: string): Promise<void> {
    await this.storage.ensureDir(dir);
  }
  async createFromUpload(
    dir: string,
    dto: CreateFileDto,
    file: Express.Multer.File,
    uploadedByUserId: string
  ): Promise<FileDocument> {
    // Build a directory structure you like, e.g.: "<collectionType>/<ownerId>"
    // const dir = `${dto.collectionType}/${dto.ownerId}`;

    const saved = await this.storage.saveBuffer(
      dir,
      file.originalname,
      file.buffer
    );

    const doc = await this.fileModel.create({
      originalName: file.originalname,
      filename: saved.filename,
      mimeType: file.mimetype,
      size: file.size,

      // Decide what "path" means for you: file system path or public URL
      path: saved.publicUrl, // or saved.fullPath
      collectionType: slugify(dto.collectionType),
      modelId: new Types.ObjectId(dto.modelId),
      modelType: dto.modelType,
      createdBy: new Types.ObjectId(uploadedByUserId),
      metadata: dto.metadata ?? {},
    });

    return doc;
  }

  // Optional: multiple files
  async createManyFromUploads(
    dir: string,
    dto: CreateFileDto,
    files: Express.Multer.File[],
    uploadedByUserId: string
  ): Promise<FileDocument[]> {
    // const dir = `${dto.collectionType}/${dto.modelId}`;

    const saved = await Promise.all(
      files.map((f) => this.storage.saveBuffer(dir, f.originalname, f.buffer))
    );

    const docs = await this.fileModel.insertMany(
      saved.map((s, i) => ({
        originalName: files[i].originalname,
        filename: s.filename,
        mimeType: files[i].mimetype,
        size: files[i].size,
        path: s.publicUrl,
        collectionType: slugify(dto.collectionType),
        modelId: new Types.ObjectId(dto.modelId),
        modelType: dto.modelType,
        createdBy: new Types.ObjectId(uploadedByUserId),
        metadata: dto.metadata ?? {},
      }))
    );

    return docs;
  }

  async getFiles(body: any = {}, req: any = {}): Promise<FileResponseDto[]> {
    const { collectionType, modelId, modelType } = body;
    const userId = req.userId;

    if (!modelId || !modelType) {
      throw new Error("modelId and modelType are required.");
    }
    const files = await this.fileModel
      .find({ modelId, modelType }, null, { sort: { createdAt: -1 } })
      .populate("createdBy", "name");
    return files.map(toFileResponseDto);
  }

  async deleteFileById(body: any, req: any): Promise<any> {
    const id = body?.id ?? body?._id ?? body?.fileId;
    if (!id || !isValidObjectId(id)) {
      throw new BadRequestException("Valid file id is required");
    }

    const doc = await this.fileModel.findById(id).lean();
    if (!doc) throw new NotFoundException("File not found");

    // (optional) authorize: only uploader (or admins) can delete
    // const userId = req.user?.userId || req.user?._id;
    // if (
    //   userId &&
    //   String(doc.uploadedBy) !== String(userId) &&
    //   !req.user?.roles?.includes?.("admin")
    // ) {
    //   throw new ForbiddenException(
    //     "You do not have permission to delete this file"
    //   );
    // }

    const fullPath = path.isAbsolute(doc.path)
      ? doc.path
      : path.join(this.storage.baseDir, doc.path.replace(/^\/+/, ""));

    await this.storage.deleteFileByFullPath(fullPath);

    await this.fileModel.deleteOne({ _id: new Types.ObjectId(id) });
    return { message: "OK", data: { id, removedFromDisk: true } };
  }

  resolveFilePath(file: FileResponseDto): string {
    if (!file?.path) return "";
    if (path.isAbsolute(file.path)) return file.path;
    return path.join(
      this.storage.baseDir,
      file.path.replace(/^[\\/]+/, "")
    );
  }

  async findByModelIds(
    modelIds: (string | Types.ObjectId)[],
    collectionType?: string
  ): Promise<FileResponseDto[]> {
    if (!Array.isArray(modelIds) || !modelIds.length) return [];

    const normalizedIds = modelIds
      .map((id) => {
        const str = typeof id === "string" ? id : id?.toString?.();
        return str && isValidObjectId(str) ? new Types.ObjectId(str) : null;
      })
      .filter((id): id is Types.ObjectId => !!id);

    if (!normalizedIds.length) return [];

    const query: Record<string, any> = {
      modelId: { $in: normalizedIds },
    };

    if (collectionType) {
      query.collectionType = slugify(collectionType);
    }

    const docs = await this.fileModel
      .find(query)
      .populate("createdBy", "name")
      .exec();

    return docs.map(toFileResponseDto);
  }

  async findByIdLean(id: string) {
    if (!isValidObjectId(id)) return null;
    return this.fileModel.findById(id).lean().exec();
  }
}
