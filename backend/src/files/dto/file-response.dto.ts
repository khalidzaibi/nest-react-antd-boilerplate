export interface FileResponseDto {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  collectionType: string;
  collectionTypeName: string;
  modelId: string;
  modelType: string;
  createdBy: string | null; // ✅ only uploader name
  updatedBy: string | null; // ✅ only updater name
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
