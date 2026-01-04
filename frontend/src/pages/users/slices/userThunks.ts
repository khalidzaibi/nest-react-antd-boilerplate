import ApiEndpoints, { SLICE_NAME } from '../enums/index';
import {
  createPostThunk,
  getPaginatedThunk,
  createUpdateThunk,
  getFilterGetThunk,
  getByIdThunk,
} from '@/stores/helpers/genaricThunk';

export const getUsers = getPaginatedThunk(SLICE_NAME, ApiEndpoints.USER);
export const getFilteredUsers = getFilterGetThunk(SLICE_NAME, ApiEndpoints.USER);

export const saveUser = createPostThunk(SLICE_NAME, ApiEndpoints.SAVE_USER);
export const updateUser = createUpdateThunk(SLICE_NAME, ApiEndpoints.UPDATE_USER);
export const updateUserPassword = createUpdateThunk(SLICE_NAME, ApiEndpoints.UPDATE_USER_PASSWORD);
export const changeMyPassword = createUpdateThunk(SLICE_NAME, ApiEndpoints.CHANGE_MY_PASSWORD);
export const getUserPermissions = getByIdThunk(SLICE_NAME, ApiEndpoints.USER_PERMISSIONS);
export const updateUserSpecialPermissions = createUpdateThunk(
  SLICE_NAME,
  ApiEndpoints.UPDATE_USER_SPECIAL_PERMISSIONS,
  'PATCH',
);
