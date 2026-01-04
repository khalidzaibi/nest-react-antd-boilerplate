import { UserDto } from "../dto/user.dto";

export function toSafeUserDto(doc: any): UserDto {
  return {
    id: doc._id?.toString() ?? String(doc._id ?? ""),
    name: doc.name,
    email: doc.email,
    designation:
      doc.designation?.toString?.() ??
      (typeof doc.designation === "string" ? doc.designation : null),
    designationName: doc.designationData?.name ?? doc.designationName ?? null,
    rolesName: doc.rolesData?.map((role: any) => role.name) ?? [],
    roles: doc.roles?.map((roleId: any) => roleId.toString()) ?? [],
    specialPermissions:
      doc.specialPermissions?.map((perm: any) => String(perm)) ?? [],
    status: doc.status,
    isPasswordChanged: Boolean(doc.isPasswordChanged),

    createdAt: doc.createdAt?.toISOString?.() ?? String(doc.createdAt ?? ""),
    updatedAt: doc.updatedAt?.toISOString?.() ?? String(doc.updatedAt ?? ""),
    createdBy: doc.createdBy?.name ?? null,
    updatedBy: doc.updatedBy?.name ?? null,

    label: doc.name,
    value: doc._id?.toString() ?? String(doc._id ?? ""),
    avatar: doc.avatar ?? null,
  };
}
