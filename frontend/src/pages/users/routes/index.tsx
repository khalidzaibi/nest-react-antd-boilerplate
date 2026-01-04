import type { MenuList } from '@/interface/layout/menu.interface';
import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const UsersPage = lazy(() => import('@/pages/users'));

export const userRoutes: MenuList = [
  {
    code: 'users',
    label: { en_US: 'Users' },
    icon: 'TeamOutlined',
    path: '/crm/users',
  },
];

export const userRouteComponents: RouteObject[] = [
  {
    path: 'crm/users',
    element: <UsersPage />,
  },
  // {
  //     path: "crm/users/:id",
  //     element: <AccountDetails />,
  // },
];
