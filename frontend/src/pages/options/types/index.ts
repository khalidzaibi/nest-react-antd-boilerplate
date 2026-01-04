export interface stateSliceTypes {
  btnLoading: boolean;
  tableLoading: boolean;
  filterLoading: boolean;
  advancedFilterOpen: boolean;
  advancedFilterLoading: boolean;

  error: string | null;
  errors: Record<string, any>;
  showError: boolean;
  drawerModel: boolean;
  editModel: Option | null;
  filters: Record<string, any>;
  sorting: Record<string, any>;
  tablePagination: Record<string, any>;

  options: Option[] | null;
  filteredOptions: Option[] | null;
  typeWithOptions: Record<string, any>;
}
export interface OptionFormType {
  id?: string;
  type: string;
  name: string;
  status?: boolean;
}
export interface Option {
  id: string;
  type: string;
  name: string;
  status?: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
