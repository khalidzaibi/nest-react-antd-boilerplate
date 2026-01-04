import React, { useEffect, useMemo, useState } from 'react';
import { Popconfirm, App, Table, Tag, Pagination, Space, Modal, Typography, Divider, Button, Tooltip } from 'antd';
import { formatDateTime } from '@/lib/helpers';
import { Role } from '../types/rolesInterface';
import { useRoleHook } from '../hooks/roleHook';
import RolePageHeader from './rolePageHeader';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateRoleDrawer from './rolesCreate';

const { Text, Title } = Typography;

const Roles: React.FC = () => {
  const { modal } = App.useApp();
  const {
    sorting,
    drawerModel,
    tablePagination,
    roles,
    tableLoading,
    getRoles,
    setPageChange,
    setDrawerModel,
    setEditRole,
    deleteRole,
    setClearFilters,
    setSorting,
    setClearSorting,
  } = useRoleHook();
  const openCreateDrawer = (role: Role) => {
    setEditRole(role);
    setDrawerModel(true);
  };
  useEffect(() => {
    getRoles();
  }, []);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openPermissionsModal = (role: Role) => {
    setViewRole(role);
    setModalOpen(true);
  };

  const closePermissionsModal = () => {
    setModalOpen(false);
    setViewRole(null);
  };

  // Count helper: safely count all permission keys from groupedPermissions
  const countPermissions = (r: any) => {
    const g = r?.groupedPermissions || {};
    return Object.values(g).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  };

  const delRole = (record: Role) => {
    modal.confirm({
      title: 'Delete Role',
      content: `Are you sure you want to delete the role "${record.name || ''}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteRole({ id: record.id });
          getRoles();
        } catch (error) {
          console.error('Failed to delete role', error);
        }
      },
    });
  };
  const columns = [
    {
      title: 'Role',
      dataIndex: 'label', // you’re showing a label; sorter still uses name
      fixed: 'left',
      sorter: true,
      sortKey: 'name',
      // sorter: (a: Role, b: Role) => a.name.localeCompare(b.name),
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'Permissions',
      key: 'permissionsCount',
      render: (_: any, record: any) => {
        const total = countPermissions(record);
        return (
          <Tag style={{ cursor: 'pointer' }} onClick={() => openPermissionsModal(record)}>
            {total} {total === 1 ? 'Permission' : 'Permissions'}
          </Tag>
        );
      },
    },
    {
      title: 'Created',
      key: 'created',
      sorter: true,
      sortKey: 'createdAt',
      render: (_: any, record: Role) => (
        <div className="flex" style={{ gap: 6, alignItems: 'center' }}>
          <span>{record.createdBy || '-'}</span>
          <span>•</span>
          <span>{formatDateTime(record.createdAt || '')}</span>
        </div>
      ),
    },
    {
      title: 'Updated',
      key: 'updated',
      sorter: true,
      sortKey: 'updatedAt',
      render: (_: any, record: Role) =>
        record.updatedBy && record.updatedAt ? (
          <div className="flex" style={{ gap: 6, alignItems: 'center' }}>
            <span>{record.updatedBy}</span>
            <span>•</span>
            <span>{formatDateTime(record.updatedAt)}</span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space.Compact>
          <Tooltip title="Edit Role">
            {' '}
            <Button type="primary" icon={<EditOutlined />} title="Edit Role" onClick={() => openCreateDrawer(record)} />
          </Tooltip>
          <Tooltip title="Delete Role">
            <Popconfirm
              title="Delete role?"
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => delRole(record)}
            >
              <Button danger type="primary" icon={<DeleteOutlined />} title="Delete Role" />
            </Popconfirm>
          </Tooltip>
        </Space.Compact>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPageChange({ page, perPage: pageSize ?? tablePagination?.perPage });
    getRoles();
  };
  const handleSort = (sorter: any) => {
    setSorting(sorter);
    getRoles();
  };
  // Modal body: module-wise tags
  const ModalBody = () => {
    if (!viewRole) return null;
    const grouped = viewRole?.groupedPermissions || {};
    const modules = Object.keys(grouped).sort();

    if (!modules.length) {
      return <Text type="secondary">No permissions assigned.</Text>;
    }

    return (
      <>
        {modules.map((mod, idx) => (
          <div key={mod} style={{ marginBottom: 2 }}>
            <Title level={5} style={{ marginBottom: 6, textTransform: 'capitalize' }}>
              {mod}
            </Title>
            <Space size={[6, 8]} wrap>
              {grouped[mod].map((p: any) => (
                <Tag key={p.key}>{p.label || p.key}</Tag>
              ))}
            </Space>
            {idx < modules.length - 1 && <Divider style={{ margin: '10px 0' }} />}
          </div>
        ))}
      </>
    );
  };

  return (
    <div>
      <RolePageHeader />

      <Table
        style={{ width: '100%', overflowX: 'auto' }}
        rowKey="id"
        columns={columns as any}
        dataSource={roles || []}
        bordered={false}
        rowSelection={rowSelection}
        loading={tableLoading}
        scroll={{ x: 'max-content' }}
        pagination={false}
        onChange={(_, __, sorter: any) => {
          if (!Array.isArray(sorter)) {
            const order = sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : null;

            // Use the column's sortKey if provided
            const col = columns.find(c => c.dataIndex === sorter.field);
            const apiColumn = col?.sortKey || sorter.field;

            // setSorting({ column: apiColumn, order });
            handleSort({ column: apiColumn, order });
          }
        }}
      />

      <Pagination
        style={{ marginTop: 5, float: 'right' }}
        current={tablePagination?.page}
        pageSize={tablePagination?.perPage}
        total={tablePagination?.total}
        showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total} Records`}
        onChange={(page, pageSize) => handlePageChange(page, pageSize)}
      />

      {/* Permissions Modal */}
      <Modal
        title={viewRole ? `Permissions • ${viewRole.label || viewRole.name}` : 'Permissions'}
        open={modalOpen}
        onCancel={closePermissionsModal}
        footer={null}
        width={720}
      >
        <ModalBody />
      </Modal>

      {/* Drawer */}
      {drawerModel && <CreateRoleDrawer />}
    </div>
  );
};

export default Roles;
