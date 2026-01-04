import type { MenuList } from '@/interface/layout/menu.interface';
import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const PermissionsPage = lazy(() => import('@/pages/rbac/permissions/index'));
const RolesPage = lazy(() => import('@/pages/rbac/roles/index'));

export const permissionRoutes: MenuList = [
  {
    code: 'roles',
    label: { en_US: 'Roles' },
    icon: 'TeamOutlined',
    path: '/rbac/roles',
  },
  {
    code: 'permissions',
    label: { en_US: 'Permissions' },
    icon: 'SafetyOutlined',
    path: '/rbac/permissions',
  },
];

export const permissionRouteComponents: RouteObject[] = [
  {
    path: 'rbac/roles',
    element: <RolesPage />,
  },
  {
    path: 'rbac/permissions',
    element: <PermissionsPage />,
  },
];
