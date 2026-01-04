import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class TagLabelDto {
  @IsOptional()
  @IsString()
  en_US?: string;
}

export class LogoutTagDto {
  @IsString()
  code: string;

  @ValidateNested()
  @Type(() => TagLabelDto)
  label: TagLabelDto;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsBoolean()
  closable?: boolean;
}

export class LogoutPayloadDto {
  @IsOptional()
  @IsString()
  lastMenu?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogoutTagDto)
  tags?: LogoutTagDto[];
}
