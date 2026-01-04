import type { FC } from 'react';

import { App, Button, Card, Form, Input, Space } from 'antd';

import { useAppSelector } from '@/stores/hooks';
import { useUserHook } from '@/pages/users/hooks/userHook';

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Props = {
  onSuccess?: () => void;
};

const UpdatePasswordCard: FC<Props> = ({ onSuccess }) => {
  const { modal, message } = App.useApp();
  const { changePassword, btnLoading } = useUserHook();
  const { auth } = useAppSelector((state: any) => state.auth);
  const userId = auth?.user?.id ?? auth?.user?._id;
  const [form] = Form.useForm<PasswordFormValues>();

  const handlePasswordChange = async (values: PasswordFormValues) => {
    if (!userId) {
      modal.error({
        title: 'Missing user information',
        content: 'Unable to update password because the user identifier is not available.',
      });
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error('New password and confirmation do not match.');
      return;
    }

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      form.resetFields();
      onSuccess?.();
    } catch (error: any) {
      modal.error({
        title: 'Password update failed',
        content: error?.message || 'Unable to update password. Please verify your current password and try again.',
      });
    }
  };

  return (
    <Card className="shadow-sm" title={<span style={{ fontWeight: 600 }}>Update Password</span>}>
      <Form layout="vertical" form={form} onFinish={handlePasswordChange} autoComplete="off">
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please enter your current password.' }]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: 'Please enter a new password.' },
            { min: 6, message: 'Password should be at least 6 characters long.' },
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm the new password.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match.'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button onClick={() => form.resetFields()} disabled={btnLoading}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit" loading={btnLoading}>
              Update Password
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UpdatePasswordCard;
