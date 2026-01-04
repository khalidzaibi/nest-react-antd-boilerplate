export type GroupedPerms = Record<string, string[]>;
export type RoleSeed =
  | { name: string; permissions: GroupedPerms } // grouped
  | { name: string; keys: string[] }; // flat

const basicPermissions = [
  "create",
  "update",
  "delete",
  "read",
  "import",
  "export",
];
const usersPermissions = [
  ...basicPermissions,
  "update-password",
  "manage-special-permissions",
];
const optionsPermissions = [...basicPermissions];
const rbacPermissions = [...basicPermissions];

export const ROLE_SEED: RoleSeed[] = [
  {
    name: "Admin",
    permissions: {
      users: usersPermissions,
      options: optionsPermissions,
      roles: rbacPermissions,
      permissions: rbacPermissions,
    },
  },
  {
    name: "User",
    permissions: {
      users: ["read"],
      options: ["read"],
      roles: ["read"],
      permissions: ["read"],
    },
  },
  // or
  // { name: 'Manager', keys: ['users.read', 'orders.create'] }
];
