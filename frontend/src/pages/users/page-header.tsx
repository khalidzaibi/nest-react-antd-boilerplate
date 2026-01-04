import { Button, Dropdown, Switch, MenuProps, Input, Space, Tooltip } from 'antd';
import {
  FileDoneOutlined,
  BarChartOutlined,
  CalendarOutlined,
  HistoryOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useUserHook } from './hooks/userHook';
import CreatePage from './create';
import type { GetProps } from 'antd';
import { hasPermission } from '@/lib/checkPermission';
import ImportUsersDrawer from './import-drawer';
import { useEffect } from 'react';
import AdvancedFilters from './AdvancedFilters';

const { Search } = Input;
type SearchProps = GetProps<typeof Input.Search>;

export default function PageHeader() {
  const {
    drawerModel,
    importDrawerModel,
    setDrawerModel,
    setImportDrawerModel,
    getUsers,
    setEditModel,
    setFilters,
    setClearFilters,
    tableLoading,
    setAdvancedFilterToggle,
    advancedFilterOpen = false,
  } = useUserHook();
  const openCreateDrawer = (open: boolean) => setDrawerModel(open);

  useEffect(() => {
    setClearFilters();
    setAdvancedFilterToggle(false);
  }, []);
  const onSearch: SearchProps['onSearch'] = (value: string) => {
    if (!value) {
      setClearFilters();
      getUsers();
      return;
    }
    setFilters({ search: value });
    getUsers();
  };
  const onClear = () => {
    setClearFilters();
    getUsers();
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'import') {
      setImportDrawerModel(true);
    }
  };

  const canGenerate = hasPermission('users.read');
  const canExport = hasPermission('users.read');
  const canImport = hasPermission('users.import');

  const menuItems: MenuProps['items'] = (() => {
    const entries: MenuProps['items'] = [];
    const add = (item: NonNullable<MenuProps['items']>[number]) => {
      if (entries.length) {
        entries.push({ type: 'divider' });
      }
      entries.push(item);
    };

    if (canGenerate) {
      add({
        key: 'generate',
        label: (
          <div className="flex items-center gap-2">
            <BarChartOutlined />
            <span>Generate Report</span>
          </div>
        ),
      });
    }
    if (canExport) {
      add({
        key: 'csv',
        label: (
          <div className="flex items-center gap-2">
            <DownloadOutlined />
            <span>Export CSV</span>
          </div>
        ),
      });
    }
    if (canImport) {
      add({
        key: 'import',
        label: (
          <div className="flex items-center gap-2">
            <FileTextOutlined />
            <span>Import CSV</span>
          </div>
        ),
      });
    }

    return entries;
  })();

  return (
    <>
      <div className="flex items-center justify-between py-2 px-2 " style={{ marginTop: 10, marginBottom: 5 }}>
        {/* Left: Search input with fixed width */}
        <Space>
          <Search placeholder="Search..." onSearch={onSearch} enterButton allowClear onClear={onClear} />
        </Space>

        {/* Right: Buttons */}
        <Space align="center" wrap>
          <Tooltip title={advancedFilterOpen ? 'Hide Filters' : 'Show Filters'}>
            <Button
              icon={advancedFilterOpen ? <UpOutlined /> : <FilterOutlined />}
              onClick={() => setAdvancedFilterToggle?.(!advancedFilterOpen)}
            >
              {advancedFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Tooltip>
          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
            <Button icon={<FileDoneOutlined />}>Reports</Button>
          </Dropdown>
          <Tooltip title="Reload">
            <Button type="primary" icon={<ReloadOutlined />} onClick={() => getUsers()} loading={tableLoading} />
          </Tooltip>
          {hasPermission('users.create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                (setEditModel(null), openCreateDrawer(true));
              }}
            >
              New
            </Button>
          )}
        </Space>

        {/* Drawer */}
        {drawerModel && <CreatePage />}
        {importDrawerModel && <ImportUsersDrawer />}
      </div>

      <AdvancedFilters />
    </>
  );
}
