import { Button, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { GetProps } from 'antd';
import CreatePermissionDrawer from './permissionsCreate';
import { usePermissionHook } from '../hooks/permissionHook';

const { Search } = Input;
type SearchProps = GetProps<typeof Input.Search>;

export function PermissionPageHeader() {
  const { drawerModel, setDrawerModel, getPermissions, setFilters, setClearFilters, setClearSorting } =
    usePermissionHook();

  const openCreateDrawer = (open: boolean) => setDrawerModel(open);

  const onSearch: SearchProps['onSearch'] = (value: string) => {
    if (!value) {
      setClearFilters();
      setClearSorting();
      getPermissions();
      return;
    }
    setFilters({ search: value });
    getPermissions();
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (!e.target.value) {
      setClearFilters();
      setClearSorting();
      getPermissions();
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-2" style={{ marginTop: 10, marginBottom: 5 }}>
      {/* Left: Search */}
      <Space>
        <Search placeholder="Search permissions…" onSearch={onSearch} onChange={onChange} enterButton allowClear />
      </Space>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateDrawer(true)}>
          New
        </Button>
      </div>

      {/* Drawer */}
      {drawerModel && <CreatePermissionDrawer />}
    </div>
  );
}

export default PermissionPageHeader;
