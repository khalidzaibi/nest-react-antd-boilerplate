// rbac/roles/slices/roleThunks.ts
import ApiEndpoints, { SLICE_NAME_ROLES } from '../enums';
import {
  createPostThunk,
  getPaginatedThunk,
  createUpdateThunk,
  createDeleteThunk,
} from '@/stores/helpers/genaricThunk';

export const getRoles = getPaginatedThunk(SLICE_NAME_ROLES, ApiEndpoints.ROLES);
export const saveRole = createPostThunk(SLICE_NAME_ROLES, ApiEndpoints.SAVE_ROLE);
export const updateRole = createUpdateThunk(SLICE_NAME_ROLES, ApiEndpoints.UPDATE_ROLE, 'PATCH');
export const deleteRole = createDeleteThunk(SLICE_NAME_ROLES, ApiEndpoints.DELETE_ROLE);

// (Optional) Add update/delete later as needed, e.g. createPatchThunk / createDeleteThunk
