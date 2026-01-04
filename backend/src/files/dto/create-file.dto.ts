// create-file.dto.ts
import { IsNotEmpty, IsString, IsMongoId, IsOptional, IsObject } from 'class-validator';

export class CreateFileDto {
    @IsNotEmpty() @IsString()
    modelType: string;                // e.g. "Account"

    @IsNotEmpty() @IsMongoId()
    modelId: string;                  // the owning doc id

    @IsNotEmpty() @IsString()
    collectionType: string;           // e.g. "accounts"

    @IsOptional() @IsObject()
    metadata?: Record<string, any>;
}
