export interface Permission {
  id: string;
  key: string; // e.g. "users.read"
  label?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PermissionFormType {
  id?: string | null;
  key: string;
  label?: string;
  description?: string;
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

  permissions: Permission[] | null;
  groupedPermissions: Record<string, Permission[]> | null;
  editPermission: Permission | null;
}
