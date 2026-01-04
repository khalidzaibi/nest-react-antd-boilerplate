export const SLICE_NAME = 'permissions';
export const SLICE_NAME_ROLES = 'roles';
enum ApiEndpoints {
  PERMISSIONS = '/permissions', // GET (paginated)
  SAVE_PERMISSION = '/permissions', // POST (create)
  ALL_GROUPED_PERMISSIONS = '/permissions/grouped', // GET
  UPDATE_PERMISSION = '/permissions/:id', // PATCH (update)
  DELETE_PERMISSION = '/permissions/:id', // DELETE

  ROLES = '/roles', // GET (paginated)
  SAVE_ROLE = '/roles', // POST (create)
  UPDATE_ROLE = '/roles/:id', // PATCH (update)
  DELETE_ROLE = '/roles/:id', // DELETE
}
export default ApiEndpoints;
