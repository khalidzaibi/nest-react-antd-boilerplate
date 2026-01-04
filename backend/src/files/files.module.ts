import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './schemas/file.schema';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileStorageService } from './file-storage.service';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: File.name, schema: FileSchema }])],
    controllers: [FilesController],
    providers: [FilesService, FileStorageService],
    exports: [FilesService], // so other modules can inject it
})
export class FilesModule { }
