import type { FC } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Tooltip, Dropdown, Avatar, theme as antdTheme, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BgColorsOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

import Avator from '@/assets/header/avator.jpeg';
// import ReactSvg from '@/assets/logo/react.svg';
import { useLocale } from '@/locales';
import { setUserItem } from '@/stores/user.store';
// import { setActiveTagPath } from '@/stores/tags-view.store';
import { getUserOnly } from '@/lib/authHelpers';
import { addTagToStorage } from '@/lib/storage';
import { useAuthHook } from '@/pages/auth/hooks/AuthHook';
import ThemeCustomizer from '@/components/ThemeCustomizer';
const whiteLogo = 'https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-white-logo-x142.webp';
const normalLogo = 'https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-logo-x143.webp';

const { Header } = Layout;

interface HeaderProps {
  collapsed: boolean;
  toggle: () => void;
}

type Action = 'logout';

const HeaderComponent: FC<HeaderProps> = ({ collapsed, toggle }) => {
  const { logout } = useAuthHook();
  const user = getUserOnly();

  const displayName = user?.name || user?.email || 'User';
  const avatarUrl = user?.avatar
    ? `${new URL(import.meta.env.VITE_API_URL).origin}/public/${String(user.avatar).replace(/^\/+/, '')}`
    : null;
  const displayInitial = (user?.name || user?.email || 'U').slice(0, 1).toUpperCase();

  const { locale, device } = useSelector((state: any) => state.user);
  const { themeKey } = useSelector((state: any) => state.global);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatMessage } = useLocale();
  const { token } = antdTheme.useToken();
  const isDark = themeKey === 'dark' || themeKey === 'blossomDark' || themeKey === 'sunsetDark';

  const onActionClick = async (action: Action) => {
    if (action === 'logout') {
      await logout();
    }
  };

  const selectLocale = ({ key }: { key: string }) => {
    dispatch(setUserItem({ locale: key }));
    localStorage.setItem('locale', key);
  };

  const openProfile = () => {
    addTagToStorage({
      code: 'profile',
      label: { en_US: 'My Profile' },
      icon: 'UserOutlined',
      path: '/crm/profile',
      closable: true,
    });
    navigate('/crm/profile');
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'name', icon: <UserOutlined />, label: displayName, disabled: true },
    { type: 'divider' },
    { key: 'profile', label: 'My Profile', onClick: openProfile },
    { key: 'logout', label: 'Logout', onClick: () => onActionClick('logout') },
  ];
  const userMenu: MenuProps = { items: userMenuItems };
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

  // Update active tag
  // useEffect(() => {
  //   dispatch(setActiveTagPath(location.pathname));
  // }, [location.pathname])

  return (
    <Header className="layout-page-header" style={{ backgroundColor: token.colorBgContainer }}>
      {device !== 'MOBILE' && (
        <div className="logo" style={{ display: 'flex', alignItems: 'center', height: 48 }}>
          <img
            src={isDark ? whiteLogo : normalLogo}
            alt="Yo! Telecom"
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      <div
        className="layout-page-header-main"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div onClick={toggle} className="sidebar-toggle" style={{ fontSize: 18, cursor: 'pointer' }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>

        <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <Tooltip title="Theme settings">
            <span style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => setThemeDrawerOpen(true)}>
              <BgColorsOutlined />
            </span>
          </Tooltip>
          <Dropdown
            menu={{
              onClick: selectLocale,
              items: [{ key: 'en_US', disabled: locale === 'en_US', label: 'English' }],
            }}
          >
            <span style={{ cursor: 'pointer', fontSize: 18 }}>
              <GlobalOutlined />
            </span>
          </Dropdown>

          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <span id="header-profile-avatar" style={{ display: 'inline-flex', marginLeft: 12 }}>
              <Avatar
                size={40}
                src={avatarUrl || undefined}
                alt={displayName}
                style={{ cursor: 'pointer', backgroundColor: token.colorPrimary }}
              >
                {displayInitial}
              </Avatar>
            </span>
          </Dropdown>
        </div>
      </div>
      <Drawer
        title={null}
        placement="right"
        width={500}
        open={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
        destroyOnHidden
        maskClosable
        styles={{
          body: {
            padding: 16,
            background: token.colorBgLayout,
          },
        }}
      >
        <ThemeCustomizer />
      </Drawer>
    </Header>
  );
};

export default HeaderComponent;
