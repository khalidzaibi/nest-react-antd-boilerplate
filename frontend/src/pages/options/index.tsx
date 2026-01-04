import React, { useMemo, useState, useEffect } from 'react';
import { Table, Input, Button, Popover, Tag, Avatar, Space, Pagination } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useOptionHook } from './hooks/optionHook';
import { Option } from './types';
import { formatDateTime } from '@/lib/helpers';
import { PageHeader } from './page-header';
import { hasPermission } from '@/lib/checkPermission';
// import { addTagToStorage } from '@/lib/storage';
// import { title } from 'process';

const Options: React.FC = () => {
  const {
    sorting,
    filters,
    tablePagination,
    options,
    tableLoading,
    getOptions,
    setPageChange,
    setSorting,
    setEditModel,
    setDrawerModel,
  } = useOptionHook();
  useEffect(() => {
    getOptions();
  }, []);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const canUpdate = hasPermission('options.update');
  const canCreate = hasPermission('options.create');
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: 'left',
      sorter: true,
      sortKey: 'name',
      ellipsis: true,
      render: (value: string) => (
        <span title={value} style={{ display: 'inline-block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      ),
      // sorter: (a: Option, b: Option) => a.name?.localeCompare(b.name || '') || 0,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sorter: true,
      sortKey: 'type',
      // sorter: (a: Option, b: Option) => a.type?.localeCompare(b.type || '') || 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: true,
      sortKey: 'status',
      render: (value: boolean) => <Tag color={value ? 'green' : 'red'}>{value ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Created',
      key: 'created',
      sorter: true,
      sortKey: 'createdAt',
      render: (_: any, record: Option) => (
        <div className="flex" style={{ gap: 6, alignItems: 'center' }}>
          <span>{record.createdBy || '-'}</span>
          <span>•</span>
          <span>{formatDateTime(record.createdAt)}</span>
        </div>
      ),
    },
    {
      title: 'Updated',
      key: 'updated',
      sorter: true,
      sortKey: 'updatedAt',
      render: (_: any, record: Option) =>
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
    ...(canUpdate || canCreate
      ? [
          {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Option) =>
              canUpdate ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditModel(record);
                    setDrawerModel(true);
                  }}
                />
              ) : null,
          },
        ]
      : []),
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => setSelectedRowKeys(selectedKeys),
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPageChange({ page, perPage: pageSize ?? tablePagination?.perPage });
    getOptions();
  };
  const handleSort = (sorter: any) => {
    setSorting(sorter);
    getOptions();
  };

  return (
    <div>
      <PageHeader />
      <Table
        style={{ width: '100%', overflowX: 'auto' }}
        rowKey="id"
        columns={columns as any}
        dataSource={options || []}
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
        // showQuickJumper
        // pageSizeOptions={['10', '20', '30', '40', '50']}
        onChange={(page, pageSize) => handlePageChange(page, pageSize)}
      />
    </div>
  );
};

export default Options;
