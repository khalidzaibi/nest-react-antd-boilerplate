import React from 'react';
import {
  Drawer,
  Button,
  Form,
  Row,
  Col,
  Input,
  Select,
  Divider,
  FormProps,
  DatePicker,
  Space,
  Tooltip,
  Spin,
  Switch,
} from 'antd';
import { validations } from './forms/validations';
import { useOptionHook } from './hooks/optionHook';
import { OPTION_TYPE_OPTIONS } from './constants';

import { getUserOnly } from '@/lib/authHelpers';
// import { useEffect, useMemo } from 'react';
// import { debounce } from 'lodash';
// import { PlusOutlined } from '@ant-design/icons';
// import CreateAccount from '../accounts/create';
import { OptionFormType } from './types';
// import type { DatePickerProps } from 'antd';

const { TextArea } = Input;

export default function CreatePage() {
  const {
    showError,
    errors,
    btnLoading,
    drawerModel,
    editModel,
    getOptions,
    setDrawerModel,
    setEditModel,
    saveOption,
    updateOption,
  } = useOptionHook();

  const [form] = Form.useForm<OptionFormType>();
  const user = getUserOnly();
  const isEditMode = !!editModel?.id;

  const onClose = () => {
    setDrawerModel(false);
    setEditModel(null);
    form.resetFields();
  };

  const initializeForm = () => {
    if (editModel) {
      form.setFieldsValue({
        name: editModel.name,
        type: editModel.type,
        status: editModel.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: true });
    }
  };

  React.useEffect(() => {
    if (drawerModel) {
      initializeForm();
    }
  }, [drawerModel, editModel]);

  const handleFinish = async (values: OptionFormType, closeDrawer: boolean) => {
    try {
      if (isEditMode && editModel?.id) {
        await updateOption({ ...values, id: editModel.id }); // throws if rejected
      } else {
        await saveOption(values); // throws if rejected
      }
      if (closeDrawer) {
        onClose();
      } else {
        form.resetFields();
        setEditModel(null);
        form.setFieldsValue({ status: true });
      }
      getOptions();
    } catch (err) {
      console.error('Save account failed', err);
    }
  };
  const onFinishFailed: FormProps<OptionFormType>['onFinishFailed'] = errorInfo => {
    console.log('Validation Failed:', errorInfo);
  };

  return (
    <Drawer
      title="New Option"
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
        initialValues={{ status: true }}
      >
        {/*  Information */}
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
              label="Type"
              name="type"
              rules={validations.type}
              validateStatus={errors?.type ? 'error' : undefined}
              help={errors?.type}
            >
              <Select placeholder="Type" showSearch options={OPTION_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col sm={24} md={8} lg={8} xl={8}>
            <Form.Item
              label="Status"
              name="status"
              rules={validations.status}
              validateStatus={errors?.status ? 'error' : undefined}
              help={errors?.status}
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
