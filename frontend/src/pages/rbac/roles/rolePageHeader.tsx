import { Button, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { GetProps } from 'antd';
import CreateRoleDrawer from './rolesCreate';
import { useRoleHook } from '../hooks/roleHook';

const { Search } = Input;
type SearchProps = GetProps<typeof Input.Search>;

export function RolePageHeader() {
  const {
    // sorting,
    // filters,
    drawerModel,
    setDrawerModel,
    getRoles,
    setEditRole,
    setClearFilters,
    setFilters,
    // setSorting,
    // setClearSorting,
  } = useRoleHook();

  const openCreateDrawer = (open: boolean) => {
    setEditRole(null);
    setDrawerModel(open);
  };

  const onSearch: SearchProps['onSearch'] = (value: string) => {
    if (!value) {
      setClearFilters();
      getRoles();
      return;
    }
    setFilters({ search: value });
    getRoles();
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (!e.target.value) {
      setClearFilters();
      getRoles();
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-2" style={{ marginTop: 10, marginBottom: 5 }}>
      {/* Left: Search */}
      <Space>
        <Search placeholder="Search roles…" onSearch={onSearch} onChange={onChange} enterButton allowClear />
      </Space>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateDrawer(true)}>
          New
        </Button>
      </div>

      {/* Drawer */}
      {drawerModel && <CreateRoleDrawer />}
    </div>
  );
}

export default RolePageHeader;
