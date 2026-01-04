export interface Role {
  id: string;
  name: string; // e.g. "manager"
  label?: string;
  permissions: string[]; // e.g. ["users.read", "orders.create"]
  description?: string;
  groupedPermissions?: Record<string, any[]>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RoleFormType {
  id?: string | null;
  name: string;
  permissions?: string[]; // optional when creating
}

export interface StateSliceTypes {
  tableLoading: boolean;
  btnLoading: boolean;
  filterLoading: boolean;

  error: string | null;
  errors: Record<string, any>;
  showError: boolean;
  drawerModel: boolean;
  filters: Record<string, any>;
  sorting: Record<string, any>;
  tablePagination: Record<string, any>;

  roles: Role[] | null;
  editRole: Role | null;
}
