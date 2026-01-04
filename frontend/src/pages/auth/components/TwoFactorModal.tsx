import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Typography, Form, Input, Button, theme } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuthHook } from '../hooks/AuthHook';

const TwoFactorModal = () => {
  const { twoFactorRequired, pendingEmail, otpExpiresInMinutes, otpExpireAt, loading, verifyLoginOtp, clearTwoFactor } =
    useAuthHook();
  const { token } = theme.useToken();
  const [otpForm] = Form.useForm();
  const [countdown, setCountdown] = useState<number | null>(null);
  const startOverRef = useRef(clearTwoFactor);

  useEffect(() => {
    startOverRef.current = clearTwoFactor;
  }, []);

  useEffect(() => {
    if (!twoFactorRequired || !otpExpireAt) {
      setCountdown(null);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, otpExpireAt - Date.now());
      setCountdown(remaining);
      if (remaining <= 0) {
        startOverRef.current();
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [twoFactorRequired, otpExpireAt]);

  const countdownText = useMemo(() => {
    if (countdown === null) return null;
    const totalSeconds = Math.max(0, Math.floor(countdown / 1000));
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, [countdown]);

  const handleSubmit = (values: any) => {
    if (!pendingEmail) return;
    verifyLoginOtp(pendingEmail, values.code);
  };

  return (
    <Modal
      open={twoFactorRequired}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SafetyCertificateOutlined style={{ color: token.colorPrimary, fontSize: 22 }} />
          <div>
            <div style={{ fontWeight: 700 }}>Two-Factor Verification</div>
            <Typography.Text type="secondary">Secure your account with a quick code check.</Typography.Text>
          </div>
        </div>
      }
      maskClosable={false}
      footer={null}
      closable={false}
      centered
      width={420}
      styles={{
        body: { paddingTop: 8, paddingBottom: 4 },
      }}
    >
      <div
        style={{
          background: token.colorFillSecondary,
          padding: 12,
          borderRadius: token.borderRadiusLG,
          marginBottom: 12,
        }}
      >
        <Typography.Text>
          Code sent to <strong>{pendingEmail}</strong>
        </Typography.Text>
        {otpExpiresInMinutes ? (
          <Typography.Text type="secondary" style={{ display: 'block' }}>
            Expires in {otpExpiresInMinutes} minute{otpExpiresInMinutes > 1 ? 's' : ''}.
          </Typography.Text>
        ) : null}
      </div>
      {countdownText ? (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Time left: {countdownText}
        </Typography.Text>
      ) : null}
      <Form form={otpForm} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="code" label="Verification Code" rules={[{ required: true, message: 'Enter the code' }]}>
          <Input placeholder="Enter 6-digit code" maxLength={6} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Verify & Sign In
          </Button>
        </Form.Item>
        <Button type="link" onClick={clearTwoFactor} block style={{ paddingLeft: 0 }}>
          Start over
        </Button>
      </Form>
    </Modal>
  );
};

export default TwoFactorModal;
