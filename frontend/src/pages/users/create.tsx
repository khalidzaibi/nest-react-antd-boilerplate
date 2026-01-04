import { Drawer, Button, Form, Row, Col, Input, Select, Divider, FormProps, Switch } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
import { validations } from './forms/validations';
import { useUserHook } from './hooks/userHook';
import { UserFormType } from './types';
import { getUserOnly } from '@/lib/authHelpers';
import { useEffect, useMemo } from 'react';
// import { debounce } from 'lodash';
import { useRoleHook } from '../rbac/hooks/roleHook';
import { useOptionHook } from '@/pages/options/hooks/optionHook';

const { TextArea } = Input;

export default function CreatePage() {
  const { roles, getRoles } = useRoleHook();
  const { filterLoading: optionLoading, typeWithOptions, getOptionsWithProvidedTypes } = useOptionHook();
  const {
    selectedModel,
    errors,
    btnLoading,
    drawerModel,
    setDrawerModel,
    setEditModel,
    getUsers,
    saveUser,
    updateUser,
  } = useUserHook();

  const [form] = Form.useForm<UserFormType>();
  const user = getUserOnly();
  const onClose = () => setDrawerModel(false);

  useEffect(() => {
    getRoles();
    getOptionsWithProvidedTypes({ types: ['user-designations'] });
  }, []);

  useEffect(() => {
    if (!drawerModel) return;
    form.resetFields();
    if (selectedModel) {
      form.setFieldsValue(selectedModel);
    }
  }, [drawerModel, selectedModel, form]);
  const handleFinish = async (values: UserFormType, closeDrawer: boolean) => {
    try {
      if (values.confirmPassword) delete values.confirmPassword;

      if (selectedModel) {
        values.id = selectedModel.id;
        await updateUser(values);
      } else {
        await saveUser(values);
      }
      if (closeDrawer) {
        onClose();
      } else {
        setEditModel(null);
        form.resetFields();
      }
      getUsers();
    } catch (err) {
      console.error('Save user failed', err);
    }
  };
  const onFinishFailed: FormProps<UserFormType>['onFinishFailed'] = errorInfo => {
    console.log('Validation Failed:', errorInfo);
  };

  return (
    <Drawer
      title={`${selectedModel ? 'Edit' : 'Create'} User`}
      width={window.innerWidth > 768 ? '50%' : '100%'}
      onClose={onClose}
      open={drawerModel}
      maskClosable={false}
      footer={
        <div>
          <Button
            type="default"
            loading={btnLoading}
            onClick={() =>
              form
                .validateFields()
                .then(values => handleFinish(values, false))
                .catch(err => console.log(err))
            }
          >
            Save & New
          </Button>
          <Button
            type="primary"
            loading={btnLoading}
            onClick={() =>
              form
                .validateFields()
                .then(values => handleFinish(values, true))
                .catch(err => console.log(err))
            }
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
        onFinish={values => handleFinish(values, true)} // Save & Close
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        {/* Account Information */}
        <Row gutter={8}>
          <Col sm={24} md={8} lg={8} xl={8}>
            <Form.Item
              label="Name"
              name="name"
              rules={validations.name}
              validateStatus={errors?.name ? 'error' : undefined}
              help={errors?.name}
            >
              <Input placeholder="Name" />
            </Form.Item>
          </Col>
          <Col sm={24} md={8} lg={8} xl={8}>
            <Form.Item
              label="Email"
              name="email"
              rules={validations.email}
              validateStatus={errors?.email ? 'error' : undefined}
              help={errors?.email}
            >
              <Input placeholder="Email" />
            </Form.Item>
          </Col>
          <Col sm={24} md={8} lg={8} xl={8}>
            <Form.Item
              label="Designation"
              name="designation"
              validateStatus={errors?.designation ? 'error' : undefined}
              help={errors?.designation}
            >
              <Select
                placeholder="Select Designation"
                allowClear
                showSearch
                loading={optionLoading}
                optionFilterProp="label"
                options={typeWithOptions?.['user-designations'] || []}
              />
            </Form.Item>
          </Col>
        </Row>
        {selectedModel && (
          <Row gutter={8}>
            <Col sm={24} md={8} lg={8} xl={8}>
              <Form.Item
                label="Status"
                name="status"
                valuePropName="checked"
                rules={validations.status}
                validateStatus={errors?.status ? 'error' : undefined}
                help={errors?.status}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        )}
        {!selectedModel && (
          <Row gutter={8}>
            <Col sm={24} md={8} lg={8} xl={8}>
              <Form.Item
                label="Password"
                name="passwordHash"
                rules={validations.passwordHash}
                validateStatus={errors?.passwordHash ? 'error' : undefined}
                help={errors?.passwordHash}
              >
                <Input placeholder="Password" />
              </Form.Item>
            </Col>
            <Col sm={24} md={8} lg={8} xl={8}>
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                rules={validations.confirmPassword}
                validateStatus={errors?.confirmPassword ? 'error' : undefined}
                help={errors?.confirmPassword}
              >
                <Input placeholder="Confirm Password" />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Additional Information */}
        <Divider orientation="left">Roles</Divider>
        <Row gutter={8}>
          <Col sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              label="Roles"
              name="roles"
              rules={validations.roles}
              validateStatus={errors?.roles ? 'error' : undefined}
              help={errors?.roles}
            >
              <Select
                mode="multiple"
                placeholder="Select Roles"
                allowClear
                options={roles || []}
                optionFilterProp="label"
                showSearch
              />
            </Form.Item>
          </Col>
        </Row>

      </Form>
    </Drawer>
  );
}
