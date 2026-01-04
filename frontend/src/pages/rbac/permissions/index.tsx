import React, { useEffect, useMemo, useState } from 'react';
import { App, Table, Input, Button, Space, Pagination, Select, Tag, Tooltip, Popconfirm } from 'antd';
import { usePermissionHook } from '../hooks/permissionHook';
import { Permission } from '../types';
import { formatDateTime } from '@/lib/helpers';
import PermissionPageHeader from './permissionPageHeader';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import CreatePermissionDrawer from './permissionsCreate';

const Index: React.FC = () => {
  const { message, modal } = App.useApp();
  const {
    sorting,
    tablePagination,
    permissions,
    tableLoading,
    drawerModel,
    getPermissions,
    setPageChange,
    // savePermission,
    setEditPermission,
    deletePermission,
    setDrawerModel,
    setFilters,
    setSorting,
    setClearSorting,
  } = usePermissionHook();

  useEffect(() => {
    getPermissions();
  }, []);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // const [moduleFilter, setModuleFilter] = useState<string>();
  // const [form, setForm] = useState<{ key: string; label?: string; description?: string }>({ key: '' });

  // const modules = useMemo(() => {
  //   const set = new Set<string>();
  //   (permissions || []).forEach(p => set.add(p.key.split('.')[0]));
  //   return Array.from(set).sort();
  // }, [permissions]);

  // const filtered = useMemo(() => {
  //   if (!moduleFilter) return permissions || [];
  //   return (permissions || []).filter(p => p.key.startsWith(`${moduleFilter}.`));
  // }, [permissions, moduleFilter]);

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      fixed: 'left',
      sorter: true,
      sortKey: 'key',
      // sorter: (a: Permission, b: Permission) => a.key.localeCompare(b.key),
      render: (k: string) => <Tag>{k}</Tag>,
    },
    { title: 'Label', dataIndex: 'label', sorter: true, sortKey: 'label', render: (v: string) => v || '-' },
    {
      title: 'Description',
      dataIndex: 'description',
      sorter: true,
      sortKey: 'description',
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: 'Created',
      key: 'created',
      sorter: true,
      sortKey: 'createdAt',
      render: (_: any, record: Permission) => (
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
      render: (_: any, record: Permission) =>
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
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_: any, record: Permission) => (
        <Space.Compact>
          <Tooltip title="Edit Permission">
            {' '}
            <Button type="primary" onClick={() => openCreateDrawer(record)} icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Delete Permission">
            <Popconfirm
              title="Delete permission?"
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => delPermission(record)}
            >
              <Button type="primary" danger icon={<DeleteOutlined />} />
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
    getPermissions();
  };
  const handleSort = (sorter: any) => {
    setSorting(sorter);
    getPermissions();
  };
  const openCreateDrawer = (record: Permission) => {
    setEditPermission(record);
    setDrawerModel(true);
  };
  const delPermission = (record: Permission) => {
    if (!record.id) return;
    modal.confirm({
      title: 'Delete Permission',
      content: `Are you sure you want to delete the permission "${record.label || record.key}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deletePermission({ id: record.id });
          getPermissions();
        } catch (error) {
          console.error('Delete permission failed', error);
        }
      },
    });
  };
  // const addPermission = async () => {
  //   if (!form.key) return;
  //   await savePermission(form as any);
  //   setForm({ key: '' });
  //   getPermissions({});
  // };

  return (
    <div>
      <PermissionPageHeader />
      <Table
        style={{ width: '100%', overflowX: 'auto' }}
        rowKey="id"
        columns={columns as any}
        dataSource={permissions || []}
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
      {/* Drawer */}
      {drawerModel && <CreatePermissionDrawer />}
    </div>
  );
};

export default Index;
