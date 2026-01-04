import type { MenuList } from '@/interface/layout/menu.interface';
import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
const OptionsPage = lazy(() => import("@/pages/options"));

export const optiontRoutes: MenuList = [
    {
        code: 'options',
        label: { en_US: 'Options' },
        icon: 'SettingOutlined',
        path: '/crm/options',
    }
];

export const optionRouteComponents: RouteObject[] = [
    {
        path: "crm/options",
        element: <OptionsPage />,
    }
];
