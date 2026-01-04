import { SetMetadata } from "@nestjs/common";

const toList = (permissions: Array<string | string[]>): string[] =>
  permissions
    .flatMap((perm) => (Array.isArray(perm) ? perm : [perm]))
    .map((perm) => perm?.trim?.() ?? "")
    .filter(Boolean);

export const PERMISSIONS_ALL_KEY = "permissions:all";
export const PERMISSIONS_ANY_KEY = "permissions:any";

export const RequireAllPermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_ALL_KEY, toList(permissions));

export const RequireAnyPermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_ANY_KEY, toList(permissions));

// Backward compatibility: default Permissions decorator requires all listed permissions.
export const Permissions = (...permissions: string[]) =>
  RequireAllPermissions(...permissions);
