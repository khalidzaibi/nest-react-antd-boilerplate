import { Controller, Get, Param, Res, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { createReadStream } from "fs";
import * as path from "path";
import contentDisposition from "content-disposition";
import { FilesService } from "./files.service";
import { FileStorageService } from "./file-storage.service";

@Controller("files")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly storage: FileStorageService
  ) {}

  @Get(":id/download")
  async download(@Param("id") id: string, @Res() res: Response) {
    const doc = await this.filesService.findByIdLean(id);
    if (!doc) throw new NotFoundException("File not found");

    const fullPath = path.isAbsolute(doc.path)
      ? doc.path
      : path.join(this.storage.baseDir, doc.path);

    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    // Properly handles UTF-8 names: filename and filename*
    res.setHeader(
      "Content-Disposition",
      contentDisposition(doc.originalName || doc.filename)
    );

    createReadStream(fullPath).pipe(res);
  }
}
