import { Injectable } from "@nestjs/common";
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
import * as path from "path";
import { promises as fsp } from "fs";
import { randomUUID } from "crypto";

// import { File as FileEntity, FileDocument } from './schemas/file.schema';
// import { CreateFileDto } from './dto/create-file.dto';

// export interface SavedFile {
//     filename: string;
//     fullPath: string;
//     relDir: string;
// }

@Injectable()
export class FileStorageService {
  // constructor(
  //     @InjectModel(FileEntity.name) private readonly fileModel: Model<FileDocument>,
  // ) { }
  // define your base directory once
  public readonly baseDir = path.resolve("./src/public");

  async ensureDir(dir: string): Promise<void> {
    await fsp.mkdir(dir, { recursive: true });
  }

  async saveBuffer(
    dir: string,
    originalName: string,
    buffer: Buffer
  ): Promise<any> {
    const makeDir = path.join(this.baseDir, dir);
    await this.ensureDir(makeDir);

    // const filename = `${Date.now()}-${originalName}`;
    const ext = path.extname(originalName);
    const base = path
      .basename(originalName, ext)
      .replace(/[^a-z0-9._-]/gi, "_"); // sanitize
    const filename = `${base}-${Date.now()}-${randomUUID()}${ext}`;

    const fullPath = path.join(makeDir, filename);
    await fsp.writeFile(fullPath, buffer);

    const relToBase = path.relative(this.baseDir, makeDir).replace(/\\/g, "/");
    const publicUrl = `${relToBase}/${filename}`;

    return { filename, fullPath, relToBase, publicUrl };
  }

  async deleteFileByFullPath(fullPath: string): Promise<void> {
    try {
      await fsp.unlink(fullPath);
    } catch {
      /* ignore if already gone */
    }
  }
}

// ****** for later use multiple files upload at once *********
// @Post('save-account-file')
//   @UseInterceptors(FilesInterceptor('files', 10))
//   async save(@UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
//     const accountId = body.account; // or from DB
//     const dest = path.join('./src/files', String(accountId));

//     const saved = await Promise.all(
//       files.map(f => this.storage.saveBuffer(dest, f.originalname, f.buffer))
//     );

//     return { message: 'Files saved', data: { account: accountId, files: saved } };
//   }
// }

// ********  for later use single file upload ********

// @Post('save-account-file')
// @UseInterceptors(FileInterceptor('files', 10)) // uses global memoryStorage
// async save(@UploadedFile() files: Express.Multer.File, @Body() body: any) {
//   const accountId = body.account; // or create record to get ID

//   const dest = path.join('accounts/', String(accountId));
//   this.storage.ensureDir(dest);
//   const saved = await Promise.all(
//     files.map(f => this.storage.saveBuffer(dest, f.originalname, f.buffer))
//   );

//   // const saved = this.storage.saveBuffer(dest, file.originalname, file.buffer);
//   return { message: 'OK', data: { account: accountId, file: saved } };
// }
