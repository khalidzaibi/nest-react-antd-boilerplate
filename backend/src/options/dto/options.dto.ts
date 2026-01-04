// options.dto.ts
import {
  IsOptional,
  IsString,
  MinLength,
  IsEmail,
  IsPhoneNumber,
  IsNumber,
  IsBoolean,
} from "class-validator";

// ------------------------
// Input DTO (for creating/updating options)
// ------------------------
export class OptionsFormDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

// ------------------------
// Output DTO (safe data for API responses)
// ------------------------
export class SafeOptionDto {
  id: string;
  name?: string;
  type?: string;
  status: number;
  user: string;

  value: string;
  label: string;

  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
}
