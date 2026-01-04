import { SafeOptionDto } from "../dto/options.dto";
import { OptionDocument } from "options/schemas/option.schema";
const toStr = (v: unknown) => (v == null ? "" : String(v));
const toId = (v: any) => v?._id?.toString?.() ?? toStr(v?._id ?? v);

export function toSafeOptionDto(
  option: OptionDocument & { user?: any; createdBy?: any; updatedBy?: any }
): SafeOptionDto {
  return {
    id: toId(option),
    name: option.name,
    type: option.type,
    user: option.user?.name || null,
    status: option.status,

    value: toId(option),
    label: `${option.name}`,
    createdAt: option.createdAt,
    updatedAt: option.updatedAt,
    createdBy: option.createdBy?.name ?? null,
    updatedBy: option.updatedBy?.name ?? null,
  };
}
