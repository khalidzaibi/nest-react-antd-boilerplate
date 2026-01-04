import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateRoleDto {
  @IsString()
  @MaxLength(60)
  name: string; // will be lowercased/trimmed in service

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Matches(/^[a-z0-9-_]+(\.[a-z0-9-_]+)+$/, { each: true })
  // @Matches(/^[a-z0-9]+(\.[a-z0-9]+)+$/, { each: true }) // module.action keys
  permissions?: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  // If you also want to support updating permissions via PATCH (optional):
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  // @Matches(/^[a-z0-9]+(\.[a-z0-9]+)+$/, { each: true })
  @Matches(/^[a-z0-9-_]+(\.[a-z0-9-_]+)+$/, { each: true })
  permissions?: string[];
}

export class SafeRoleDto {
  id: string;
  name: string;
  permissions: string[];
  groupedPermissions: any;

  createdAt?: string;
  updatedAt?: string;
  createdBy?: { id: string; name?: string; email?: string };
  updatedBy?: { id: string; name?: string; email?: string };

  label: string;
  value: string;
}
