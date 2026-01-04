import type { FC, ReactElement } from 'react';
import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import { hasModuleAccess } from '@/lib/checkPermission';
import LayoutPage from '@/pages/layout';
import LoginPage from '@/pages/auth/pages/loginForm';
import { DEFAULT_HOME_PATH } from '@/lib/storage';

const NotFound = lazy(() => import('@/pages/404'));
const ForbiddenPage = lazy(() => import('@/pages/auth/pages/Forbidden'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/pages/forgotPassword'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/pages/resetPassword'));
const ProfilePage = lazy(() => import('@/pages/auth/pages/profile'));
import { optionRouteComponents } from '@/pages/options/routes';
import { permissionRouteComponents } from '@/pages/rbac/routes';
import { userRouteComponents } from '@/pages/users/routes';

const hasRbacAccess = () => hasModuleAccess('permissions') || hasModuleAccess('roles');

const getDefaultChildPath = () => {
  if (hasModuleAccess('users')) return 'crm/users';
  if (hasRbacAccess()) return 'rbac/roles';
  if (hasModuleAccess('options')) return 'crm/options';
  return DEFAULT_HOME_PATH.replace(/^\//, '');
};

const routes: FC = () => {
  const defaultChildPath = getDefaultChildPath();
  const element = useRoutes([
    {
      path: '/login',
      element: <PublicRoute element={<LoginPage />} />,
    },
    {
      path: '/forgot-password',
      element: <PublicRoute element={<ForgotPasswordPage />} />,
    },
    {
      path: '/reset-password',
      element: <PublicRoute element={<ResetPasswordPage />} />,
    },
    {
      path: '/',
      element: <PrivateRoute element={<LayoutPage />} />,
      children: [
        { path: '', element: <Navigate to={defaultChildPath} replace /> },
        { path: 'crm/profile', element: <ProfilePage /> },
        ...(hasModuleAccess('options') ? optionRouteComponents : []),
        ...(hasRbacAccess() ? permissionRouteComponents : []),
        ...(hasModuleAccess('users') ? userRouteComponents : []),
        { path: '403', element: <ForbiddenPage /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);

  return element;
};

export default routes;
