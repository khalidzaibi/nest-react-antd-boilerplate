import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
  getPermissions,
  savePermission,
  getAllGroupedPermissions,
  updatePermission,
  deletePermission,
} from '../slices/permissionThunks';
import {
  clearError,
  setDrawerModel,
  setClearFilters,
  setPageChange,
  setEditPermission,
  setFilters,
  setSorting,
  setClearSorting,
} from '../slices/permissionSlice';
import { StateSliceTypes, PermissionFormType } from '../types';
import { SLICE_NAME } from '../enums';

export const usePermissionHook = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => <StateSliceTypes>(state as any)[SLICE_NAME]);

  return {
    ...state,
    deletePermission: async (data: any) => dispatch(deletePermission(data)).unwrap(),
    updatePermission: async (data: PermissionFormType) => dispatch(updatePermission(data)).unwrap(),
    getAllGroupedPermissions: async () => dispatch(getAllGroupedPermissions()).unwrap(),
    getPermissions: async () => dispatch(getPermissions()).unwrap(),
    savePermission: async (data: PermissionFormType) => dispatch(savePermission(data)).unwrap(),

    clearError: () => dispatch(clearError()),
    setClearFilters: () => dispatch(setClearFilters()),
    setDrawerModel: (data: boolean) => dispatch(setDrawerModel(data)),
    setPageChange: (data: { page?: number; perPage?: number }) => dispatch(setPageChange(data)),
    setEditPermission: (data: any) => dispatch(setEditPermission(data)),
    setFilters: (data: any) => dispatch(setFilters(data)),
    setSorting: (data: any) => dispatch(setSorting(data)),
    setClearSorting: () => dispatch(setClearSorting()),
  };
};
