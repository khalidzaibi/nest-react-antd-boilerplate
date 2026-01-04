import type { MenuList } from '@/interface/layout/menu.interface';
import { hasModuleAccess } from '@/lib/checkPermission';

import { optiontRoutes } from '@/pages/options/routes/index';
import { permissionRoutes } from '@/pages/rbac/routes/index';
import { userRoutes } from '@/pages/users/routes/index';

const hasRbacAccess = () => hasModuleAccess('permissions') || hasModuleAccess('roles');

export const mockMenuList: MenuList = [
  ...(hasModuleAccess('users') ? userRoutes : []),
  ...(hasRbacAccess() ? permissionRoutes : []),
  ...(hasModuleAccess('options') ? optiontRoutes : []),
];
