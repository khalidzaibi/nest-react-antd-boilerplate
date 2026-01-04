import type { MenuList } from '../../interface/layout/menu.interface';
import type { FC } from 'react';

import { Menu } from 'antd';
import * as AntdIcons from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  // addTagToStorage
  LAST_MAIN_MENU_LOCAL_STORAGE_KEY,
  setData,
} from '@/lib/storage';

import { setUserItem } from '@/stores/user.store';

interface MenuProps {
  menuList: MenuList;
  openKey?: string;
  onChangeOpenKey: (key?: string) => void;
  selectedKey: string;
  onChangeSelectedKey: (key: string) => void;
}

const MenuComponent: FC<MenuProps> = ({ menuList, openKey, onChangeOpenKey, selectedKey, onChangeSelectedKey }) => {
  const { device, locale } = useSelector((state: any) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get Antd Icon dynamically
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (AntdIcons as Record<string, any>)[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const renderLabel = (menu: MenuList[0]) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {renderIcon(menu.icon)}
      <span>{menu.label['en_US']}</span>
    </span>
  );

  // Recursive function to transform menu list into AntD Menu items
  const generateMenuItems = (menus: MenuList): any[] => {
    return menus.map(menu => {
      if (menu.children && menu.children.length > 0) {
        return {
          key: menu.code,
          label: renderLabel(menu),
          children: generateMenuItems(menu.children),
        };
      }
      return {
        key: menu.path || menu.code,
        label: renderLabel(menu),
      };
    });
  };

  const handleMenuClick = (path: string) => {
    onChangeSelectedKey(path);
    navigate(path);
    const menuItem = findMenu(menuList, path);
    if (menuItem) {
      // addTagToStorage(menuItem);
      setData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY, path);
    }

    if (device !== 'DESKTOP') {
      dispatch(setUserItem({ collapsed: true }));
    }
  };
  const findMenu = (menus: MenuList, path?: string): any => {
    for (const menu of menus) {
      if (menu.path === path || menu.code === path) return menu;
      if (menu.children) {
        const child = findMenu(menu.children);
        if (child) return child;
      }
    }
  };

  const handleOpenChange = (keys: string[]) => {
    const key = keys.pop();
    onChangeOpenKey(key);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      openKeys={openKey ? [openKey] : []}
      onOpenChange={handleOpenChange}
      onSelect={({ key }) => handleMenuClick(key)}
      className="layout-page-sider-menu"
      items={generateMenuItems(menuList)}
    />
  );
};

export default MenuComponent;
