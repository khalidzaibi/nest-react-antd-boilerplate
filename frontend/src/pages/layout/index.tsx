// import type { MenuChild, MenuList } from '@/interface/layout/menu.interface';
import type { FC } from 'react';

import './index.less';

import { Drawer, Layout, Spin, theme as antTheme } from 'antd';
import { Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router';

// import { getMenuList } from '@/api/layout.api';
import { mockMenuList } from '@/mock/menu.mock';
import { setUserItem } from '@/stores/user.store';
import { getFirstPathCode } from '@/utils/getFirstPathCode';
import { getGlobalState } from '@/utils/getGloabal';

import HeaderComponent from './header';
import MenuComponent from './menu';
import TagsView from './tagView';
import AuthBackgroundCanvas from '@/pages/auth/components/AuthBackgroundCanvas';

const { Sider, Content } = Layout;
const WIDTH = 992;

const LayoutPage: FC = () => {
  const location = useLocation();
  const [openKey, setOpenkey] = useState<string>();
  const [selectedKey, setSelectedKey] = useState<string>(location.pathname);
  // const [menuList, setMenuList] = useState<MenuList>([]);
  const { device, collapsed } = useSelector((state: any) => state.user);
  const token = antTheme.useToken();

  const isMobile = device === 'MOBILE';
  const dispatch = useDispatch();

  useEffect(() => {
    const code = getFirstPathCode(location.pathname);

    setOpenkey(code);
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  const toggle = () => {
    dispatch(
      setUserItem({
        collapsed: !collapsed,
      }),
    );
  };

  // const initMenuListAll = (menu: MenuList) => {
  //   const MenuListAll: MenuChild[] = [];

  //   menu.forEach(m => {
  //     if (!m?.children?.length) {
  //       MenuListAll.push(m);
  //     } else {
  //       m?.children.forEach(mu => {
  //         MenuListAll.push(mu);
  //       });
  //     }
  //   });

  //   return MenuListAll;
  // };

  // const fetchMenuList = useCallback(async () => {
  //   const { status, result } = await getMenuList();

  //   if (status) {
  //     setMenuList(result);
  //     dispatch(
  //       setUserItem({
  //         menuList: initMenuListAll(result),
  //       }),
  //     );
  //   }
  // }, [dispatch]);

  // useEffect(() => {
  //   fetchMenuList();
  // }, [fetchMenuList]);

  useEffect(() => {
    window.onresize = () => {
      const { device } = getGlobalState();
      const rect = document.body.getBoundingClientRect();
      const needCollapse = rect.width < WIDTH;

      dispatch(
        setUserItem({
          device,
          collapsed: true, //needCollapse,
        }),
      );
    };
  }, [dispatch]);


  return (
    <Layout className="layout-page">
      <AuthBackgroundCanvas className="layout-background-canvas" />
      <HeaderComponent collapsed={collapsed} toggle={toggle} />
      <Layout>
        {!isMobile ? (
          <Sider
            className="layout-page-sider"
            trigger={null}
            collapsible
            style={{ backgroundColor: token.token.colorBgContainer }}
            collapsedWidth={isMobile ? 0 : 80}
            collapsed={collapsed}
            breakpoint="md"
          >
            <MenuComponent
              menuList={mockMenuList}
              openKey={openKey}
              onChangeOpenKey={k => setOpenkey(k)}
              selectedKey={selectedKey}
              onChangeSelectedKey={k => setSelectedKey(k)}
            />
          </Sider>
        ) : (
          <Drawer
            width="200"
            placement="left"
            style={{ padding: 0, height: '100%' }}
            closable={false}
            onClose={toggle}
            open={!collapsed}
          >
            <MenuComponent
              menuList={mockMenuList}
              openKey={openKey}
              onChangeOpenKey={k => setOpenkey(k)}
              selectedKey={selectedKey}
              onChangeSelectedKey={k => setSelectedKey(k)}
            />
          </Drawer>
        )}
        <Content className="layout-page-content">
          <TagsView />
          <Suspense fallback={<Spin size="small" />}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
