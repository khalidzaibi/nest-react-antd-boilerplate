import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

export class UserImportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  designation?: string; // name from CSV

  @IsOptional()
  @IsString()
  role?: string; // name from CSV

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
