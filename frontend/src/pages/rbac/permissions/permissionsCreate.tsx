import React, { useEffect, useMemo, useState } from 'react';
import { Space, Tooltip, Drawer, Button, Form, Row, Col, Input, FormProps } from 'antd';
import { validations } from '../forms/validations';
import { usePermissionHook } from '../hooks/permissionHook';
import { getUserOnly } from '@/lib/authHelpers';
import { PermissionFormType } from '../types';
import { InfoCircleFilled } from '@ant-design/icons';
import { allowedModules } from '@/lib/dom';

const { TextArea } = Input;

export default function CreatePermissionDrawer() {
  const {
    editPermission,
    errors,
    btnLoading,
    drawerModel,
    getPermissions,
    setDrawerModel,
    savePermission,
    updatePermission,
  } = usePermissionHook();

  const [form] = Form.useForm<PermissionFormType>();
  const user = getUserOnly();
  useEffect(() => {
    if (editPermission) {
      form.setFieldsValue(editPermission);
    }
  }, [editPermission]);
  const onClose = () => setDrawerModel(false);

  const handleFinish = async (values: PermissionFormType, closeDrawer: boolean) => {
    try {
      if (editPermission) {
        values.id = editPermission?.id;
        await updatePermission(values);
      } else {
        await savePermission(values);
      }

      if (closeDrawer) onClose();
      else form.resetFields();

      getPermissions();
    } catch (err) {
      console.error('Save permission failed', err);
    }
  };

  const onFinishFailed: FormProps<PermissionFormType>['onFinishFailed'] = errorInfo => {
    console.log('Validation Failed:', errorInfo);
  };

  return (
    <Drawer
      title={editPermission ? 'Edit Permission' : 'Create Permission'}
      width={window.innerWidth > 768 ? '50%' : '100%'}
      onClose={onClose}
      open={drawerModel}
      maskClosable={false}
      footer={
        <div>
          <Button
            type="default"
            loading={btnLoading}
            style={{ marginRight: 8 }}
            onClick={() => form.validateFields().then(values => handleFinish(values, false))}
          >
            Save & New
          </Button>
          <Button
            type="primary"
            loading={btnLoading}
            onClick={() => form.validateFields().then(values => handleFinish(values, true))}
            style={{ marginRight: 8 }}
          >
            Save & Close
          </Button>
          <Button onClick={onClose} danger>
            Cancel
          </Button>
        </div>
      }
      extra={
        <>
          Owner: <b>{user?.name}</b>
        </>
      }
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={values => handleFinish(values, true)}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Row gutter={8}>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <Space.Compact style={{ width: '100%' }}>
                  <Space>Key </Space>
                </Space.Compact>
              }
              tooltip={`Format: <module>.<action>. E.g., users.read. Allowed modules: ${allowedModules.join(', ')}.`}
              name="key"
              rules={validations.key}
              validateStatus={errors?.key ? 'error' : undefined}
              help={errors?.key}
            >
              <Input disabled={!!editPermission} placeholder="e.g., users.read" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Label"
              name="label"
              rules={validations.label}
              validateStatus={errors?.label ? 'error' : undefined}
              help={errors?.label}
            >
              <Input placeholder="Read Users" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={validations.description}
              validateStatus={errors?.description ? 'error' : undefined}
              help={errors?.description}
            >
              <TextArea rows={3} placeholder="Human-friendly description (optional)" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
