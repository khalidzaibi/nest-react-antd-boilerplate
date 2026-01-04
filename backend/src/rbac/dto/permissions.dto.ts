// src/rbac/dto/create-permission.dto.ts
import { IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class CreatePermissionDto {
  @IsString()
  @Matches(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, {
    message:
      'Key must follow "module.action" format (e.g., users.read or users.create-item)',
  })
  key: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class SafePermissionDto {
  id: string;
  key: string;
  label?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { id: string; name?: string; email?: string };
  updatedBy?: { id: string; name?: string; email?: string };
}
