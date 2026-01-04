import { Button, Dropdown, Switch, MenuProps, Input, Space, Tooltip } from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  CloseOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useOptionHook } from './hooks/optionHook';
import CreatePage from './create';
import type { GetProps } from 'antd';
import AdvancedFilters from './AdvancedFilters';
import { hasPermission } from '@/lib/checkPermission';

const { Search } = Input;
type SearchProps = GetProps<typeof Input.Search>;

export function PageHeader() {
  const {
    advancedFilterOpen,
    advancedFilterLoading,
    setAdvancedFilterToggle,
    drawerModel,
    setDrawerModel,
    setEditModel,
    getOptions,
    setClearFilters,
    setFilters,
    tableLoading,
  } = useOptionHook();
  const canCreate = hasPermission('options.create');
  const canUpdate = hasPermission('options.update');
  const openCreateDrawer = (open: boolean) => {
    setEditModel(null);
    setDrawerModel(open);
  };
  const onSearch: SearchProps['onSearch'] = (value: string) => {
    if (!value) {
      setClearFilters();
      getOptions();
      return;
    }
    setFilters({ search: value });
    getOptions();
  };
  const onClear = () => {
    setClearFilters();
    getOptions();
  };

  return (
    <>
      <div className="flex items-center justify-between py-2 px-2" style={{ marginTop: 10, marginBottom: 5 }}>
        {/* Left: Search input with fixed width */}
        <Space>
          <Search placeholder="Search..." onSearch={onSearch} enterButton allowClear onClear={onClear} />
        </Space>
        {/* Right: Buttons */}
        <div className="flex items-center space-x-2">
          <Button icon={<FilterOutlined />} type="default" onClick={() => setAdvancedFilterToggle(!advancedFilterOpen)}>
            {advancedFilterOpen ? 'Hide Filters' : 'Show Filters'}{' '}
            {advancedFilterOpen ? <UpOutlined /> : <DownOutlined />}
          </Button>
          <Tooltip title="Reload">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => getOptions()}
              loading={tableLoading}
            />
          </Tooltip>
          {canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateDrawer(true)}>
              New
            </Button>
          )}
        </div>

        {/* Drawer */}
        {(canCreate || canUpdate) && drawerModel && <CreatePage />}
      </div>

      <AdvancedFilters />
    </>
  );
}
