import { getAuth } from './authHelpers';
export const hasPermission = (permissionKey: string): boolean => {
  // Example permissionKey: "users.read"
  const auth = getAuth();
  if (!auth) return false;

  //  Role override: if Super Admin, always true
  if (auth.user.roles?.includes('admin')) {
    return true;
  }

  if (!auth || !auth?.user.permissions) return false;

  const modulePermissions = auth.user.permissions;
  if (!modulePermissions) return false;

  return modulePermissions.includes(permissionKey);
};

export const hasModuleAccess = (moduleKey: string): boolean => {
  const auth = getAuth();
  if (!auth) return false;

  //  Role override: if Super Admin, always true
  if (auth.user.roles?.includes('admin')) {
    return true;
  }

  if (!auth || !auth?.user.modules) return false;

  const userModules = auth.user.modules;
  if (!userModules) return false;

  return userModules.includes(moduleKey);
};

export const hasAnyPermission = (permissionKeys: string[]): boolean => {
  return permissionKeys.some(permission => hasPermission(permission));
};

export const hasAllPermissions = (permissionKeys: string[]): boolean => {
  return permissionKeys.every(permission => hasPermission(permission));
};

export const hasRole = (roleKey: string): boolean => {
  const auth = getAuth();
  if (!auth) return false;

  const roles = auth.user.roles || [];
  // if (roles.includes('admin')) return true;

  return roles.includes(roleKey);
};

export const hasAnyRole = (roleKeys: string[]): boolean => {
  return roleKeys.some(role => hasRole(role));
};

export const hasAllRoles = (roleKeys: string[]): boolean => {
  return roleKeys.every(role => hasRole(role));
};
