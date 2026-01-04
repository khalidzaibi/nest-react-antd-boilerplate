import type { FC } from 'react';
import { useEffect, useState } from 'react';
import './index.less';
import { Card, Form, Input, Button, Typography, Alert, App, theme } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuthHook } from '../hooks/AuthHook';
import { useSelector } from 'react-redux';
import AuthBackgroundCanvas from '../components/AuthBackgroundCanvas';
import { isDarkTheme } from '@/themePresets';

const { Title, Paragraph, Text } = Typography;

type ForgotPasswordForm = {
  email: string;
};

const ForgotPasswordPage: FC = () => {
  const { message } = App.useApp();
  const { forgotPassword, loading, error, clearError } = useAuthHook();
  const [form] = Form.useForm<ForgotPasswordForm>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { themeKey: currentTheme } = useSelector((state: any) => state.global);
  const logoSrc =
    isDarkTheme(currentTheme)
      ? 'https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-white-logo-x142.webp'
      : 'https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-logo-x143.webp';
  const { token } = theme.useToken();

  useEffect(() => {
    clearError();
    setSuccessMessage(null);
  }, [clearError]);

  const handleSubmit = async (values: ForgotPasswordForm) => {
    try {
      await forgotPassword(values.email);
      setSuccessMessage('If an account exists for this email, a reset link has been sent.');
      // message.success('Password reset instructions sent.');
      form.resetFields();
    } catch (err: any) {
      const feedback = err?.message || 'Unable to process request. Please try again.';
      message.error(feedback);
      setSuccessMessage(null);
    }
  };

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
          <img src={logoSrc} alt="YO Telecom Logo" className="h-16 object-contain mx-auto" />
        </div>

        <Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>
          Forgot Password
        </Title>
        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
          Enter your email address and we will send you instructions to reset your password.
        </Paragraph>

        {error && <Alert style={{ marginBottom: 16 }} message={error} type="error" showIcon closable />}
        {successMessage && (
          <Alert style={{ marginBottom: 16 }} message={successMessage} type="success" showIcon closable />
        )}

        <Form<ForgotPasswordForm> form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email address.' },
              { type: 'email', message: 'Please enter a valid email address.' },
            ]}
          >
            <Input placeholder="you@example.com" prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text>
            Remembered your password?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
