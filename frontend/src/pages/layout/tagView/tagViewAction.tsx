import type { FC } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  getTags,
  setTags,
  removeTagFromStorage,
  clearTags,
  DEFAULT_HOME_PATH,
  getData,
  LAST_MAIN_MENU_LOCAL_STORAGE_KEY,
} from '@/lib/storage';

interface TagsViewActionProps {
  activeTag: string;
  setTagsState: (tags: any[]) => void;
  setActiveTag: (path: string) => void;
}

const TagsViewAction: FC<TagsViewActionProps> = ({ activeTag, setTagsState, setActiveTag }) => {
  const navigate = useNavigate();
  const lastMainMenu = getData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY) as string | undefined;
  const lastMainMenuPath =
    lastMainMenu && typeof lastMainMenu === 'string'
      ? lastMainMenu.startsWith('/')
        ? lastMainMenu
        : `/${lastMainMenu}`
      : null;

  const closeCurrent = () => {
    if (activeTag === DEFAULT_HOME_PATH) return;
    const closedIndex = getTags().findIndex(t => t.path === activeTag);

    const updated = removeTagFromStorage(activeTag);
    setTagsState(updated);

    let nextActive = lastMainMenuPath || DEFAULT_HOME_PATH;
    if (updated.length) {
      if (closedIndex > 0) {
        nextActive = updated[closedIndex - 1].path; // previous tab
      }
    }

    setActiveTag(nextActive);
    navigate(nextActive);
  };

  const closeOther = () => {
    const tags = getTags();
    const updated = tags.filter(t => t.path === activeTag);
    setTags(updated);
    setTagsState(updated);
  };

  const closeAll = () => {
    const targetPath = lastMainMenuPath || DEFAULT_HOME_PATH;

    clearTags();
    setTagsState([]);
    setActiveTag(targetPath);
    navigate(targetPath);
  };

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: '0',
            onClick: closeCurrent,
            label: 'Close Current',
          },
          {
            key: '1',
            onClick: closeOther,
            label: 'Close Others',
          },
          {
            key: '2',
            onClick: closeAll,
            label: 'Close All',
          },
          {
            key: '3',
            type: 'divider',
          },
          {
            key: '4',
            label: <Link to={DEFAULT_HOME_PATH}>Home</Link>,
          },
        ],
      }}
    >
      <span id="pageTabs-actions">
        <SettingOutlined className="tagsView-extra" />
      </span>
    </Dropdown>
  );
};

export default TagsViewAction;
