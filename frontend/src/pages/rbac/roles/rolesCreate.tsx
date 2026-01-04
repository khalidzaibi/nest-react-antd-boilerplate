import './rolesCreate.less';
import React, { useEffect, useMemo, useState } from 'react';
import { Drawer, Button, Form, Row, Col, Input, FormProps, Collapse, Checkbox, Spin, Typography, Divider } from 'antd';
import { useRoleHook } from '../hooks/roleHook';
import { usePermissionHook } from '../hooks/permissionHook';
import { getUserOnly } from '@/lib/authHelpers';
import { RoleFormType } from '../types/rolesInterface';

const { Text } = Typography;

export default function CreateRoleDrawer() {
  const { editRole, btnLoading, drawerModel, errors, updateRole, getRoles, setDrawerModel, saveRole } = useRoleHook();
  const { groupedPermissions, filterLoading, getAllGroupedPermissions } = usePermissionHook();

  const [form] = Form.useForm<RoleFormType>();
  const user = getUserOnly();
  const onClose = () => setDrawerModel(false);

  // Local selection state (separate from Form)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    getAllGroupedPermissions();
  }, []);

  useEffect(() => {
    if (editRole) {
      form.setFieldsValue(editRole);
      setSelectedKeys(editRole.permissions || []);
    }
  }, [editRole]);

  // Modules list (sorted) + open all panels
  const modules = useMemo(() => Object.keys(groupedPermissions || {}).sort(), [groupedPermissions]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  useEffect(() => setActiveKeys(modules), [modules]);

  // Toggle Select All for a module
  const toggleModuleAll = (module: string) => {
    const current = new Set(selectedKeys);
    const moduleKeys = (groupedPermissions?.[module] || []).map(p => p.key);
    const allSelected = moduleKeys.every(k => current.has(k));
    if (allSelected) moduleKeys.forEach(k => current.delete(k));
    else moduleKeys.forEach(k => current.add(k));
    setSelectedKeys(Array.from(current));
  };
  const handleGroupChange = (module: string, values: (string | number)[]) => {
    const moduleKeys = (groupedPermissions?.[module] || []).map(p => p.key);
    const keptFromOtherModules = selectedKeys.filter(k => !moduleKeys.includes(k)); // keep others
    const merged = Array.from(new Set([...keptFromOtherModules, ...(values as string[])]));
    setSelectedKeys(merged);
  };
  // Header checkbox state for a module
  const moduleSelectState = (module: string) => {
    const moduleKeys = (groupedPermissions?.[module] || []).map(p => p.key);
    const count = moduleKeys.filter(k => selectedKeys.includes(k)).length;
    return {
      checked: moduleKeys.length > 0 && count === moduleKeys.length,
      indeterminate: count > 0 && count < moduleKeys.length,
    };
  };

  // Build Collapse items (no <Panel> children)
  const collapseItems = useMemo(() => {
    return modules.map(mod => {
      const perms = (groupedPermissions && groupedPermissions[mod]) || [];
      const options = perms.map(p => ({ label: p.label || p.key, value: p.key }));
      const { checked, indeterminate } = moduleSelectState(mod);

      return {
        key: mod,
        label: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{mod}</span>,
        extra: (
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onClick={e => e.stopPropagation()}
            onChange={e => {
              e.stopPropagation();
              toggleModuleAll(mod);
            }}
          >
            Select all
          </Checkbox>
        ),
        children: (
          <div onClick={e => e.stopPropagation()}>
            <Checkbox.Group
              options={options}
              value={selectedKeys} // global selection
              onChange={vals => handleGroupChange(mod, vals)} // <- merge, don't replace
              className="permissions-grid"
            />
          </div>
        ),
        collapsible: 'icon' as const,
      };
    });
  }, [modules, groupedPermissions, selectedKeys]);

  const handleFinish = async (values: RoleFormType, closeDrawer: boolean) => {
    try {
      // inject selected permission keys
      const payload = { ...values, permissions: selectedKeys };
      if (editRole) {
        payload.id = editRole?.id;
        await updateRole(payload as any);
      } else {
        await saveRole(payload as any);
      }

      if (closeDrawer) onClose();
      else {
        form.resetFields();
        setSelectedKeys([]);
      }
      getRoles();
    } catch (err) {
      console.error('Save role failed', err);
    }
  };

  const onFinishFailed: FormProps<RoleFormType>['onFinishFailed'] = errorInfo => {
    console.log('Validation Failed:', errorInfo);
  };

  return (
    <Drawer
      title={editRole ? 'Edit Role' : 'New Role'}
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
              label="Role Name"
              name="name"
              rules={[{ required: true, message: 'Role name is required' }]}
              validateStatus={errors?.name ? 'error' : undefined}
              help={errors?.name}
            >
              <Input placeholder="e.g., manager" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Permissions
        </Typography.Title>
        <Spin spinning={!!filterLoading}>
          {modules.length === 0 ? (
            <Text type="secondary">No permissions found.</Text>
          ) : (
            <Collapse
              accordion={false}
              items={collapseItems}
              activeKey={activeKeys}
              onChange={keys => setActiveKeys(keys as string[])}
            />
          )}
        </Spin>
      </Form>
    </Drawer>
  );
}
