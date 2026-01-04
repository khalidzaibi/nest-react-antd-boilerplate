import { IsOptional, IsString, MinLength, IsArray } from "class-validator";

export class UserDto {
  @IsString()
  id: string | null;

  @IsString()
  email: string;

  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  designation?: string | null;

  @IsOptional()
  @IsString()
  designationName?: string | null;

  @IsOptional()
  roles?: string[];

  @IsOptional()
  rolesName?: string[];

  @IsOptional()
  specialPermissions?: string[];

  @IsOptional()
  status?: boolean;

  @IsOptional()
  isPasswordChanged?: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsOptional()
  @IsString()
  createdBy?: string | null;

  @IsOptional()
  @IsString()
  updatedBy?: string | null;

  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  avatar?: string | null;
}

export class CreateUserDto {
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  passwordHash: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialPermissions?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, {
    each: false,
    message: "Password must be at least 6 characters long",
  })
  passwordHash?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialPermissions?: string[];

  @IsOptional()
  status?: boolean;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  avatar?: string | null;
}

export class UpdateUserPasswordDto {
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  passwordHash: string;
}
