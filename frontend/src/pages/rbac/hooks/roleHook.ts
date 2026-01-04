import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getRoles, saveRole, updateRole, deleteRole } from '../slices/roleThunks';
import {
  setFilters,
  setSorting,
  setClearSorting,
  clearError,
  setDrawerModel,
  setClearFilters,
  setPageChange,
  setEditRole,
} from '../slices/roleSlice';
import { StateSliceTypes, RoleFormType } from '../types/rolesInterface';
import { SLICE_NAME_ROLES } from '../enums';

export const useRoleHook = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => <StateSliceTypes>(state as any)[SLICE_NAME_ROLES]);

  return {
    ...state,
    deleteRole: async (data: any) => dispatch(deleteRole(data)).unwrap(),
    updateRole: async (data: any) => dispatch(updateRole(data)).unwrap(),
    getRoles: async () => dispatch(getRoles()).unwrap(),
    saveRole: async (data: RoleFormType) => dispatch(saveRole(data)).unwrap(),

    clearError: () => dispatch(clearError()),
    setClearFilters: () => dispatch(setClearFilters()),
    setDrawerModel: (open: boolean) => dispatch(setDrawerModel(open)),
    setPageChange: (page: { page?: number; perPage?: number }) => dispatch(setPageChange(page)),
    setEditRole: (data: any) => dispatch(setEditRole(data)),
    setFilters: (data: any) => dispatch(setFilters(data)),
    setSorting: (data: any) => dispatch(setSorting(data)),
    setClearSorting: () => dispatch(setClearSorting()),
  };
};
