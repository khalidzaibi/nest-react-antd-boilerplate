import type { FC } from 'react';
import './index.less';
import { Form, Input, Button, Checkbox, Card, Alert, theme } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthHook } from '../hooks/AuthHook';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthBackgroundCanvas from '../components/AuthBackgroundCanvas';
import { isDarkTheme } from '@/themePresets';
import TwoFactorModal from '../components/TwoFactorModal';

const initialValues = {
  email: 'admin@example.com',
  password: 'Admin@123',
};

const LoginForm: FC = () => {
  const { error, loading, login, twoFactorRequired } = useAuthHook();
  const { themeKey: currentTheme } = useSelector((state: any) => state.global);
  const logoSrc = isDarkTheme(currentTheme)
    ? 'https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-white-logo-x142.webp'
    : 'https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-logo-x143.webp';
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    await login(values.email, values.password);
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
        {/* Centered Logo */}
        <div className="flex justify-center mb-8 mx-auto">
          <img src={logoSrc} alt="YO Telecom Logo" className="h-16 object-contain mx-auto" />
        </div>

        {/* {error && <Alert style={{ marginBottom: 16 }} message={error} type="error" showIcon />} */}

        <Form name="login" form={form} onFinish={onFinish} layout="vertical" initialValues={initialValues}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input your email!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="Password"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>

          <div className="text-center mt-2">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </Form>

        {twoFactorRequired ? <TwoFactorModal /> : null}
      </Card>
    </div>
  );
};

export default LoginForm;
