export interface stateSliceTypes {
  btnLoading: boolean;
  tableLoading: boolean;
  filterLoading: boolean;
  advancedFilterOpen?: boolean;

  error: string | null;
  errors: Record<string, any>;
  showError: boolean;
  drawerModel: boolean;
  importDrawerModel: boolean;
  users: User[] | null;
  filters: Record<string, any>;
  sorting: Record<string, any>;
  tablePagination: Record<string, any>;
  filteredUsers: User[] | null;

  selectedModel: User | null;
  specialPermissionsDrawer: boolean;
  rolePermissions: string[];
  specialPermissions: string[];
}
export interface UserFormType {
  id: string | null;
  name: string;
  email: string;
  designation?: string;
  passwordHash?: string;
  confirmPassword?: string;
  roles: string[];
  status: boolean;
}
export interface User {
  id: string;
  name: string;
  email?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;

  roles?: string[];
  rolesName?: string[];
  status?: boolean;
  designation?: string;
  designationName?: string;
  avatar?: string;
}
