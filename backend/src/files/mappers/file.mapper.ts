import { FileDocument } from "../schemas/file.schema";
import { FileResponseDto } from "../dto/file-response.dto";
import { unslugify } from "../../utils/helpers";

export function toFileResponseDto(file: FileDocument): FileResponseDto {
  return {
    id: file._id.toString(),
    originalName: file.originalName,
    filename: file.filename,
    mimeType: file.mimeType,
    size: file.size,
    path: file.path,
    collectionType: file.collectionType,
    collectionTypeName: unslugify(file.collectionType),
    modelId: (file as any).modelId?.toString?.() || null,
    modelType: file.modelType,
    createdBy: (file as any).createdBy?.name || null, // ✅ only name
    updatedBy: (file as any).updatedBy?.name || null,
    metadata: file.metadata ?? {},
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
}
