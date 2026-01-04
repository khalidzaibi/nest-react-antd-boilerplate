import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
  getUsers,
  saveUser,
  updateUser,
  getFilteredUsers,
  changeMyPassword,
  updateUserPassword,
  getUserPermissions,
  updateUserSpecialPermissions,
} from '../slices/userThunks';
import {
  clearError,
  setDrawerModel,
  setClearFilters,
  setPageChange,
  setEditModel,
  setImportDrawerModel,
  setClearSorting,
  setFilters,
  setSorting,
  setSpecialPermissionsDrawer,
  setAdvancedFilter,
} from '../slices/userSlice';
import { stateSliceTypes, UserFormType, User } from '../types';
import { SLICE_NAME } from '../enums';

export const useUserHook = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => <stateSliceTypes>state[SLICE_NAME]);

  const actions = useMemo(
    () => ({
      getFilteredUsers: () => dispatch(getFilteredUsers()),
      updateUser: (data: UserFormType) => dispatch(updateUser(data)),
      changePassword: (data: { currentPassword: string; newPassword: string }) => dispatch(changeMyPassword(data)),
      updateUserPassword: (data: { id: string; password: string }) => dispatch(updateUserPassword(data)),
      saveUser: (data: UserFormType) => dispatch(saveUser(data)),
      getUsers: () => dispatch(getUsers()),
      getUserPermissions: (id: string) => dispatch(getUserPermissions(id)).unwrap(),
      updateUserSpecialPermissions: (data: { id: string; specialPermissions: string[] }) =>
        dispatch(updateUserSpecialPermissions(data)).unwrap(),
      clearError: () => dispatch(clearError()),
      setClearFilters: () => dispatch(setClearFilters()),
      setDrawerModel: (data: boolean) => dispatch(setDrawerModel(data)),
      setImportDrawerModel: (data: boolean) => dispatch(setImportDrawerModel(data)),
      setPageChange: (data: { page?: number; perPage?: number }) => dispatch(setPageChange(data)),
      setEditModel: (data: User | null) => dispatch(setEditModel(data)),
      setSpecialPermissionsDrawer: (data: boolean) => dispatch(setSpecialPermissionsDrawer(data)),
      setClearSorting: () => dispatch(setClearSorting()),
      setSorting: (data: any) => dispatch(setSorting(data)),
      setFilters: (data: any) => dispatch(setFilters(data)),
      setAdvancedFilterToggle: (open: boolean) => dispatch(setAdvancedFilter(open)),
    }),
    [dispatch],
  );

  return {
    ...state,
    ...actions,
  };
};
