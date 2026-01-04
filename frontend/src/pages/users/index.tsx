import React, { useState, useEffect } from 'react';
import { App, Button, Tooltip, Table, Space, Tag, Pagination, Modal, Typography, Form, Input } from 'antd';
import { EditOutlined, KeyOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useUserHook } from './hooks/userHook';
import { User } from './types';
import { formatDateTime } from '@/lib/helpers';
import PageHeader from './page-header';
import { ColumnsType } from 'antd/es/table';
import CreatePage from './create';
import { hasPermission } from '@/lib/checkPermission';
import SpecialPermissionsDrawer from './components/SpecialPermissionsDrawer';

const { Text } = Typography;

const Users: React.FC = () => {
  const { modal } = App.useApp();
  const {
    sorting,
    selectedModel,
    drawerModel,
    tablePagination,
    users,
    tableLoading,
    setDrawerModel,
    setPageChange,
    getUsers,
    setEditModel,
    setClearSorting,
    setFilters,
    setSorting,
    updateUser,
    updateUserPassword,
    btnLoading,
    setSpecialPermissionsDrawer,
    specialPermissionsDrawer,
  } = useUserHook();

  useEffect(() => {
    getUsers();
  }, []);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 👇 state for roles modal
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);

  const openPasswordModal = (record: User) => {
    setPasswordModalUser(record);
    setPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPasswordModalUser(null);
  };

  const handlePasswordUpdate = async (values: any) => {
    if (!passwordModalUser) return;
    const payload = {
      id: passwordModalUser.id,
      passwordHash: values.passwordHash,
    };
    try {
      await updateUserPassword(payload as any).unwrap();
      // modal.success({
      //   title: 'Password updated',
      //   content: `${passwordModalUser.name || passwordModalUser.email} password updated successfully.`,
      // });
      closePasswordModal();
    } catch (err: any) {
      modal.error({
        title: 'Update failed',
        content: err?.message || 'Unable to update password. Please try again.',
      });
    }
  };

  const [rolesModalUser, setRolesModalUser] = useState<User | null>(null);

  const openRolesModal = (record: User) => {
    setRolesModalUser(record);
    setRolesModalOpen(true);
  };
  const closeRolesModal = () => {
    setRolesModalOpen(false);
    setRolesModalUser(null);
  };

  const openSpecialPermissionsDrawer = (record: User) => {
    setEditModel(record);
    setSpecialPermissionsDrawer(true);
  };

  const editRecord = (record: User) => {
    setEditModel(record);
    setDrawerModel(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: 'left',
      sorter: true,
      sortKey: 'name',
      render: (_: any, record: User) => <Space>{record.name}</Space>,
      // sorter: (a, b) => a.name?.localeCompare(b.name || '') || 0,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      sortKey: 'email',
    },
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designation',
      sorter: true,
      sortKey: 'designation',
      render: (_: any, record: User) => record.designationName || record.designation || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      sortKey: 'status',
      render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (_: any, record: any) => {
        const total =
          (Array.isArray(record.rolesName) && record.rolesName.length) ||
          (Array.isArray(record.roles) && record.roles.length) ||
          0;

        return (
          <Tag style={{ cursor: 'pointer' }} onClick={() => openRolesModal(record)}>
            {total} {total === 1 ? 'Role' : 'Roles'}
          </Tag>
        );
      },
    },
    {
      title: 'Created',
      key: 'created',
      sorter: true,
      sortKey: 'createdAt',
      render: (_: any, record: User) => (
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
      render: (_: any, record: User) =>
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
      render: (_: any, record: User) => (
        <Space size={0}>
          {hasPermission('users.update') && (
            <Tooltip title="Edit User">
              <Button type="primary" icon={<EditOutlined />} title="Edit User" onClick={() => editRecord(record)} />
            </Tooltip>
          )}
          {hasPermission('users.update-password') && (
            <Tooltip title="Change Password">
              <Button icon={<KeyOutlined />} title="Change Password" onClick={() => openPasswordModal(record)} />
            </Tooltip>
          )}
          {hasPermission('users.manage-special-permissions') && (
            <Tooltip title="Assign Special Permissions">
              <Button
                icon={<SafetyOutlined />}
                title="Assign Special Permissions"
                onClick={() => openSpecialPermissionsDrawer(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => setSelectedRowKeys(selectedKeys),
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPageChange({ page, perPage: pageSize ?? tablePagination?.perPage });
    getUsers();
  };
  const handleSort = (sorter: any) => {
    setSorting(sorter);
    getUsers();
  };

  return (
    <div>
      <PageHeader />
      <Table
        style={{ width: '100%', overflowX: 'auto' }}
        rowKey="id"
        columns={columns as ColumnsType<User>}
        dataSource={users || []}
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
        current={tablePagination.page}
        pageSize={tablePagination.perPage}
        total={tablePagination.total}
        showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total} Records`}
        onChange={(page, pageSize) => handlePageChange(page, pageSize)}
      />

      {/* Password Modal */}
      <Modal
        title={
          passwordModalUser
            ? `Change Password • ${passwordModalUser.name || passwordModalUser.email}`
            : 'Change Password'
        }
        open={passwordModalOpen}
        onCancel={closePasswordModal}
        footer={null}
        destroyOnHidden={true}
      >
        <Form layout="vertical" onFinish={handlePasswordUpdate}>
          <Form.Item
            label="New Password"
            name="passwordHash"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['passwordHash']}
            rules={[
              { required: true, message: 'Please confirm the password' },
              { min: 6, message: 'Password must be at least 6 characters' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('passwordHash') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={closePasswordModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={btnLoading}>
              Update Password
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Roles Modal */}
      <Modal
        title={rolesModalUser ? `Roles • ${rolesModalUser.name || rolesModalUser.email}` : 'Roles'}
        open={rolesModalOpen}
        onCancel={closeRolesModal}
        footer={null}
        width={560}
      >
        {rolesModalUser?.rolesName?.length ? (
          <Space size={[6, 8]} wrap>
            {rolesModalUser.rolesName.map((r: string) => (
              <Tag key={r}>{r}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">No roles assigned.</Text>
        )}
      </Modal>

      {specialPermissionsDrawer && <SpecialPermissionsDrawer />}
    </div>
  );
};

export default Users;
