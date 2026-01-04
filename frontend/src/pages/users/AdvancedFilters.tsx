import { Card, Col, Form, Input, Row, Select, Space, Button, Divider, Tooltip } from 'antd';
import { FilterOutlined, SearchOutlined, ReloadOutlined, CloseOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { useUserHook } from './hooks/userHook';
import { useRoleHook } from '../rbac/hooks/roleHook';
import { useOptionHook } from '@/pages/options/hooks/optionHook';

const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

const AdvancedFilters = () => {
  const [form] = Form.useForm();
  const { setFilters, setClearFilters, getUsers, filterLoading, advancedFilterOpen = false, filters } = useUserHook();
  const { setAdvancedFilterToggle } = useUserHook();
  const { roles, getRoles } = useRoleHook();
  const { typeWithOptions, getOptionsWithProvidedTypes } = useOptionHook();
  const optionTypes = ['user-designations'];

  useEffect(() => {
    getRoles();
    getOptionsWithProvidedTypes({ types: optionTypes, page: 1, perPage: 500 });
  }, []);

  const roleOptions = useMemo(
    () => (roles || []).map(r => ({ label: r.label || r.name || r.id, value: r.id || r.label })),
    [roles],
  );

  const designationOptions = useMemo(
    () =>
      (typeWithOptions?.['user-designations'] || []).map((opt: any) => ({
        label: opt.label || opt.name || opt.value,
        value: opt.value || opt.id || opt.label,
      })),
    [typeWithOptions],
  );

  const cleanValues = (values: Record<string, any>) =>
    Object.entries(values).reduce<Record<string, any>>((acc, [key, value]) => {
      if (value === undefined || value === null || value === '') return acc;
      acc[key] = value;
      return acc;
    }, {});

  const handleApply = () => {
    const values = cleanValues(form.getFieldsValue());
    setClearFilters();
    setFilters(values);
    getUsers();
  };

  const handleReset = () => {
    form.resetFields();
    setClearFilters();
    getUsers();
  };

  return (
    <Card className={`filter-panel ${advancedFilterOpen ? 'open' : ''}`}>
      <Divider orientation="left">
        <Space>
          <FilterOutlined />
          Advanced Filters
        </Space>
      </Divider>
      <Form layout="vertical" form={form} onFinish={handleApply}>
        <Row gutter={8}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item name="name" label="Name">
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item name="email" label="Email">
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item name="designations" label="Designation">
              <Select
                mode="multiple"
                allowClear
                options={designationOptions}
                showSearch
                placeholder="Select designation"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item name="status" label="Status">
              <Select mode="multiple" allowClear options={statusOptions} placeholder="Select status" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Form.Item name="roles" label="Roles">
              <Select mode="multiple" allowClear options={roleOptions} placeholder="Select roles" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={filterLoading}>
                  Apply
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  Reset
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={() => setAdvancedFilterToggle?.(false)}>
                  Close
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default AdvancedFilters;
