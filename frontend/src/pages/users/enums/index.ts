export const SLICE_NAME = 'users';
enum ApiEndpoints {
  USER = '/users',
  SAVE_USER = '/users',
  UPDATE_USER = '/users/:id',
  UPDATE_USER_PASSWORD = '/users/:id/password',
  CHANGE_MY_PASSWORD = '/auth/me/password',
  USER_PERMISSIONS = '/users/:id/permissions',
  UPDATE_USER_SPECIAL_PERMISSIONS = '/users/:id/permissions/special',
}
export default ApiEndpoints;
