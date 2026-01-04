import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './index.less';
import { Card, Form, Input, Button, Typography, Alert, App, theme } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuthHook } from '../hooks/AuthHook';
import { useSelector } from 'react-redux';
import AuthBackgroundCanvas from '../components/AuthBackgroundCanvas';
import { isDarkTheme } from '@/themePresets';

const { Title, Paragraph, Text } = Typography;

type ResetPasswordForm = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordPage: FC = () => {
  const { message } = App.useApp();
  const { resetPassword, loading, error, clearError } = useAuthHook();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<ResetPasswordForm>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { themeKey: currentTheme } = useSelector((state: any) => state.global);
  const logoSrc =
    isDarkTheme(currentTheme)
      ? 'https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-white-logo-x142.webp'
      : 'https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-logo-x143.webp';
  const { token } = theme.useToken();

  const resetToken = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams]);

  useEffect(() => {
    clearError();
    setSuccessMessage(null);
    if (email) {
      form.setFieldsValue({ email });
    }
  }, [email, form, clearError]);

  const handleSubmit = async (values: ResetPasswordForm) => {
    if (!resetToken || !values.email) {
      message.error('Invalid reset link.');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ email: values.email, token: resetToken, newPassword: values.newPassword });
      setSuccessMessage('Password updated successfully. You can now sign in with your new password.');
      // message.success('Password updated successfully.');
      form.resetFields(['newPassword', 'confirmPassword']);
    } catch (err: any) {
      const feedback = err?.message || 'Unable to reset password. Please try again.';
      setSuccessMessage(null);
      message.error(feedback);
    }
  };

  const isLinkInvalid = !resetToken || !email;

  return (
    <div
      className="login-page min-h-screen flex items-center justify-center p-4"
      style={{ background: token.colorBgLayout, color: token.colorText }}
    >
      <AuthBackgroundCanvas />
      <Card
        className="login-card w-full max-w-lg"
        style={{ borderRadius: token.borderRadiusLG }}
        styles={{ body: { background: token.colorBgElevated, padding: 48, borderRadius: token.borderRadiusLG } }}
      >
        <div className="flex justify-center mb-8 mx-auto">
          <img
            src={logoSrc}
            alt="YO Telecom Logo"
            className="h-16 object-contain mx-auto"
          />
        </div>

        <Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>
          Reset Password
        </Title>
        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
          {isLinkInvalid ? 'The reset link is invalid or has expired.' : 'Create a new password for your account.'}
        </Paragraph>

        {error && <Alert style={{ marginBottom: 16 }} message={error} type="error" showIcon closable />}
        {successMessage && (
          <Alert style={{ marginBottom: 16 }} message={successMessage} type="success" showIcon closable />
        )}

        <Form<ResetPasswordForm> form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            initialValue={email}
            rules={[{ required: true, message: 'Email is required.' }]}
            extra="This field is pre-filled from the reset link."
          >
            <Input placeholder="Email" readOnly disabled />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter a new password.' },
              { min: 6, message: 'Password should be at least 6 characters long.' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New password" />
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
                  return Promise.reject(new Error('The two passwords do not match.'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} disabled={isLinkInvalid}>
              Update Password
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text>
            Go back to{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
