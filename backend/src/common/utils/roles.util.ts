import { UsersService } from "../../users/users.service";
import { RolesCacheService } from "../services/roles-cache.service";

let usersServiceRef: UsersService | null = null;
let rolesCacheRef: RolesCacheService | null = null;

type RoleHelperDeps = {
  usersService: UsersService;
  rolesCache: RolesCacheService;
};

export function configureRoleHelpers(deps: RoleHelperDeps) {
  usersServiceRef = deps.usersService;
  rolesCacheRef = deps.rolesCache;
}

function normalizeRoleName(role?: string | null): string | null {
  if (!role || typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase();
  return normalized || null;
}

async function loadRoles(userId: string): Promise<string[]> {
  if (!rolesCacheRef || !usersServiceRef) {
    throw new Error("Role helpers not configured with required services");
  }

  const cached = rolesCacheRef.get(userId);
  if (cached) return cached;

  const { rolesName } = await usersServiceRef.rolePermissions(userId);
  const normalized = Array.from(
    new Set((rolesName || []).map((r) => normalizeRoleName(r)).filter(Boolean) as string[])
  );
  rolesCacheRef.set(userId, normalized);
  return normalized;
}

export async function hasRole(userId: string, role: string): Promise<boolean> {
  const target = normalizeRoleName(role);
  if (!target) return false;

  const roles = await loadRoles(userId);
  return roles.includes(target);
}

export async function hasAnyRole(
  userId: string,
  roles: string[]
): Promise<boolean> {
  if (!Array.isArray(roles) || roles.length === 0) return false;
  const normalizedTargets = roles
    .map((role) => normalizeRoleName(role))
    .filter(Boolean) as string[];
  if (normalizedTargets.length === 0) return false;

  const userRoles = await loadRoles(userId);
  return normalizedTargets.some((target) => userRoles.includes(target));
}
