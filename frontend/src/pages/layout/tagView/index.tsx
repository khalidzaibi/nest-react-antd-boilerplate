import type { FC } from 'react';
import { Dropdown, Tabs, theme as antdTheme } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
import { MenuList } from '@/interface/layout/menu.interface';
import TagsViewAction from './tagViewAction';
import {
  getTags,
  // addTagToStorage,
  removeTagFromStorage,
  // setTags,
  setData,
  getData,
  LAST_MAIN_MENU_LOCAL_STORAGE_KEY,
  DEFAULT_HOME_PATH,
} from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import * as AntdIcons from '@ant-design/icons';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { mockMenuList } from '@/mock/menu.mock';

const { TabPane } = Tabs;

const TagsView: FC = () => {
  // const { activeTagId } = useSelector((state: any) => state.tagsView);

  const navigate = useNavigate();
  const location = useLocation();
  const [tagsState, setTagsState] = useState<any[]>([]);
  const [activeTag, setActiveTag] = useState(location.pathname);
  const { token } = antdTheme.useToken();
  const [dropdownLabel, setDropdownLabel] = useState(
    mockMenuList[0]?.label.en_US || 'Home'
  );

  // --- Load tags on mount ---
  useEffect(() => {
    const storedTags = getTags();
    if (storedTags.length) {
      setTagsState(storedTags);
      // ensure activeTag is valid
      if (!storedTags.some(t => t.path === activeTag)) {
        setActiveTag(storedTags[storedTags.length - 1].path);
      }
    }
    findMainLastMenuLabel();
  }, []);

  // --- Update tag on route change ---
  useEffect(() => {
    let storedTags = getTags();
    // --- if storage empty, add default dashboard ---
    // if (storedTags.length === 0) {
    //   const dashboardTag = {
    //     code: 'dashboard',
    //     label: { en_US: 'Dashboard' },
    //     icon: 'DashboardOutlined',
    //     path: `${DASHBOARD}`,
    //     closable: false,
    //   };
    //   storedTags = addTagToStorage(dashboardTag);
    // }

    setTagsState(storedTags);
    setActiveTag(location.pathname);
    findMainLastMenuLabel();
  }, [location.pathname]);


  // --- On tab click ---
  const onChange = (key: string) => {
    setActiveTag(key);
    navigate(key);
  };

  // --- On tab close ---
  const onClose = (path: string) => {
    const updated = removeTagFromStorage(path);
    setTagsState(updated);

    // if active tab removed, switch to last tab or dashboard
    if (activeTag === path) {
      const lastMainMenu = getData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY) || DEFAULT_HOME_PATH;
      const fallbackPath =
        typeof lastMainMenu === 'string'
          ? lastMainMenu.startsWith('/')
            ? lastMainMenu
            : `/${lastMainMenu}`
          : DEFAULT_HOME_PATH;
      const nextPath = updated.length ? updated[updated.length - 1].path : fallbackPath;
      setActiveTag(nextPath);
      navigate(nextPath);
    }
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (AntdIcons as Record<string, any>)[iconName];
    return IconComponent ? <IconComponent /> : null;
  };
  const generateDropdownItems = (mockMenuList: MenuList): MenuProps['items'] => {
    return mockMenuList.map(menu => ({
      key: menu.path || menu.code,
      label: menu.label.en_US,
      icon: renderIcon(menu.icon),
      children: menu.children ? generateDropdownItems(menu.children) : undefined,
    }));
  };

  const dropdownItems = generateDropdownItems(mockMenuList) || [];

  const handleLabelClick = () => {
    const lastMenu = getData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY) || mockMenuList[0]?.path || DEFAULT_HOME_PATH;
    const destination =
      typeof lastMenu === 'string'
        ? lastMenu.startsWith('/')
          ? lastMenu
          : `/${lastMenu}`
        : DEFAULT_HOME_PATH;

    navigate(destination);
    setActiveTag(destination);
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setActiveTag(key);
    navigate(key);
    setData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY, key);
    findMainLastMenuLabel();
  };

  const findMainLastMenuLabel = () => {
    const lastMenu = getData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY) || mockMenuList[0]?.path;
    setDropdownLabel(
      mockMenuList.find(item => item.path === lastMenu)?.label.en_US || 'Home'
    );
  };

  // useEffect(() => {
  //   setActiveTag(activeTagId);
  //   findMainLastMenuLabel();
  // }, [activeTagId])
  return (
    <div id="pageTabs"
    // style={{ padding: '6px 4px' }}
    >

      <Tabs
        activeKey={activeTag}
        onChange={onChange}
        type="editable-card"
        hideAdd
        onEdit={(targetKey, action) =>
          action === 'remove' && onClose(targetKey as string)
        }
        // tabBarExtraContent={<TagsViewAction activeTag={activeTag} setTagsState={setTagsState} setActiveTag={setActiveTag} />}
        tabBarStyle={{
          margin: 0,
          borderBottom: `1px solid ${token.colorPrimary}`, // uses theme primary color
          background: token.colorBgContainer,
        }}
        tabBarExtraContent={{
          left: (
            <>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  onClick={handleLabelClick}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRight: `1px solid ${token.colorPrimary}`,
                    // borderLeft: `1px solid ${token.colorPrimary}`,
                    minWidth: 130,
                    background: activeTag == getData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY) ? token.colorBgContainer : token.colorBgContainer,
                    color: activeTag == getData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY) ? token.colorPrimary : token.colorText,
                  }}
                >
                  {dropdownLabel}
                </span>

                {/* Arrow part → click to open dropdown */}
                <Dropdown
                  menu={{ items: dropdownItems, onClick: handleMenuClick }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <span
                    style={{
                      cursor: 'pointer',
                      padding: '6px 8px',
                      borderRight: `1px solid ${token.colorPrimary}`,

                    }}
                  >
                    <DownOutlined />
                  </span>
                </Dropdown>
              </div>
            </>
          ),
          right: (
            <TagsViewAction
              activeTag={activeTag}
              setTagsState={setTagsState}
              setActiveTag={setActiveTag}
            />
          ),
        }}

        items={getTags().map((tag) => ({
          key: tag.path,
          closable: tag.path !== DEFAULT_HOME_PATH && tag.closable,
          label: tag.label['en_US'],
          // icon: renderIcon(tag.icon as string || ''),

        }))}
      />
    </div>
  );
};

export default TagsView;
