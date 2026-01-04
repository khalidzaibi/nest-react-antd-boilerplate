import ApiEndpoints, { SLICE_NAME } from '../enums';
import {
  createPostThunk,
  getPaginatedThunk,
  createUpdateThunk,
  createDeleteThunk,
} from '@/stores/helpers/genaricThunk';

export const getPermissions = getPaginatedThunk(SLICE_NAME, ApiEndpoints.PERMISSIONS);
export const savePermission = createPostThunk(SLICE_NAME, ApiEndpoints.SAVE_PERMISSION);
export const getAllGroupedPermissions = getPaginatedThunk(SLICE_NAME, ApiEndpoints.ALL_GROUPED_PERMISSIONS);
export const updatePermission = createUpdateThunk(SLICE_NAME, ApiEndpoints.UPDATE_PERMISSION, 'PATCH');
export const deletePermission = createDeleteThunk(SLICE_NAME, ApiEndpoints.DELETE_PERMISSION);
