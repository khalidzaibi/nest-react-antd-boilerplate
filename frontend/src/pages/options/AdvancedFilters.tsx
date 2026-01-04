import { useState, useEffect, useMemo } from 'react';
import { Card, Select, Spin, Divider, Form, Row, Col, Button, Dropdown, Switch, MenuProps, Input, Space } from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useOptionHook } from './hooks/optionHook';
import { OPTION_TYPE_OPTIONS } from './constants';

export default function AdvancedFilters() {
  const [form] = Form.useForm();
  const {
    advancedFilterOpen,
    advancedFilterLoading,
    setAdvancedFilterToggle,
    getOptions,
    setFilters,
    setClearFilters,
  } = useOptionHook();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setFilters(values);
    // setAdvancedFilterToggle(false);
    getOptions();
  };

  const handleReset = () => {
    form.resetFields();
    setClearFilters();
    getOptions();
  };
  const handleToggle = () => {
    setAdvancedFilterToggle(!advancedFilterOpen);
  };

  return (
    <div>
      {/* Sliding Panel */}
      <div className={`filter-panel ${advancedFilterOpen ? 'open' : ''}`}>
        <Card>
          <Divider orientation="left">
            <Space>
              <FilterOutlined />
              Advanced Filters
            </Space>
          </Divider>

          <Form form={form} layout="vertical" onFinish={handleSearch} onReset={handleReset}>
            <Row gutter={8}>
              <Col xs={24} sm={12} md={4} lg={4}>
                <Form.Item name="name" label="Name">
                  <Input placeholder="Enter  Name" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4} lg={4}>
                <Form.Item name="type" label="Type">
                  <Select placeholder="Select Type" allowClear showSearch options={OPTION_TYPE_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4} lg={4}>
                <Form.Item name="status" label="Status">
                  <Select placeholder="Select Status" showSearch>
                    <Select.Option value={1}>Active</Select.Option>
                    <Select.Option value={0}>Inactive</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Action Buttons */}
              <Col xs={24}>
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                    Apply Filters
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    Reset
                  </Button>
                  <Button color="danger" variant="solid" icon={<CloseOutlined />} onClick={handleToggle}>
                    Close
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
}
