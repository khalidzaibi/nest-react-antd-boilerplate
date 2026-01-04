import { useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Tag,
  Typography,
  List,
  Collapse,
  Badge,
  Avatar,
  Upload,
  theme,
} from 'antd';
import { useAppSelector } from '@/stores/hooks';
import { useAuthHook } from '@/pages/auth/hooks/AuthHook';
import { UploadOutlined } from '@ant-design/icons';
import UpdatePasswordCard from '../components/UpdatePasswordCard';

const { Text } = Typography;

const normalizeArray = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => (typeof item === 'string' ? item : String(item))).filter(Boolean);
  }
  if (value) {
    return [String(value)];
  }
  return [];
};

export default function ProfilePage() {
  const { modal } = App.useApp();
  const { token } = theme.useToken();
  const { auth } = useAppSelector((state: any) => state.auth);
  const user = auth?.user;

  const { uploadAvatar, loading } = useAuthHook();

  const roles = useMemo(() => normalizeArray(user?.rolesName ?? user?.roles), [user?.rolesName, user?.roles]);
  const permissions = useMemo(() => normalizeArray(user?.permissions), [user?.permissions]);
  const modules = useMemo(() => normalizeArray(user?.modules), [user?.modules]);
  const [activePanels, setActivePanels] = useState<string[]>(['roles']);

  const handleAvatarUpload = async (file: File) => {
    const isImage = /^image\/(png|jpeg|jpg|webp)$/.test(file.type);
    if (!isImage) {
      modal.error({ title: 'Invalid file type', content: 'Please select a PNG, JPG, or WEBP image.' });
      return Upload.LIST_IGNORE;
    }
    if (file.size > 5 * 1024 * 1024) {
      modal.error({ title: 'File too large', content: 'Avatar must be under 5MB.' });
      return Upload.LIST_IGNORE;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      uploadAvatar(formData);
    } catch (error: any) {}
    return Upload.LIST_IGNORE;
  };

  if (!user) {
    return (
      <Card className="shadow-sm" style={{ marginTop: 12 }}>
        <Empty description="No profile information available." />
      </Card>
    );
  }

  return (
    <div className="py-0">
      <Row gutter={[8, 8]}>
        <Col xs={24} lg={14}>
          <Card className="shadow-sm" title={<span style={{ fontWeight: 600 }}>Profile Information</span>}>
            <Row gutter={[8, 8]}>
              <Col xs={24} md={12}>
                <Descriptions column={1} layout="horizontal">
                  <Descriptions.Item label="Name">{user?.name || user?.fullName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Email">{user?.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Designation">{user?.designationName || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Avatar
                  size={100}
                  src={
                    user?.avatar
                      ? `${new URL(import.meta.env.VITE_API_URL).origin}/public/${String(user.avatar).replace(
                          /^\/+/,
                          '',
                        )}`
                      : undefined
                  }
                  style={{ backgroundColor: token.colorPrimary, fontSize: 36, color: token.colorTextLightSolid }}
                >
                  {(user?.name || user?.email || '?').slice(0, 1).toUpperCase()}
                </Avatar>
                <Upload
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                  disabled={loading}
                >
                  <Button icon={<UploadOutlined />} loading={loading} type="primary">
                    {loading ? 'Uploading...' : 'Upload Avatar'}
                  </Button>
                </Upload>
                <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>PNG, JPG, or WEBP up to 5MB.</div>
              </Col>
            </Row>
          </Card>

          <Card className="shadow-sm" title={<span style={{ fontWeight: 600 }}>Access Overview</span>}>
            <Collapse
              bordered={false}
              activeKey={activePanels}
              onChange={keys => setActivePanels(Array.isArray(keys) ? (keys as string[]) : [keys as string])}
              accordion
            >
              <Collapse.Panel
                header={
                  <Space>
                    <Text strong>Roles</Text>
                    <Badge count={roles.length} showZero color="blue" />
                  </Space>
                }
                key="roles"
              >
                {roles.length ? (
                  <Space size={[8, 8]} wrap>
                    {roles.map(role => (
                      <Tag key={role} color="blue">
                        {role}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">No roles assigned.</Text>
                )}
              </Collapse.Panel>

              <Collapse.Panel
                header={
                  <Space>
                    <Text strong>Modules</Text>
                    <Badge count={modules.length} showZero color="geekblue" />
                  </Space>
                }
                key="modules"
              >
                {modules.length ? (
                  <Space size={[8, 8]} wrap>
                    {modules.map(module => (
                      <Tag key={module} color="geekblue">
                        {module}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">No modules available.</Text>
                )}
              </Collapse.Panel>

              <Collapse.Panel
                header={
                  <Space>
                    <Text strong>Permissions</Text>
                    <Badge count={permissions.length} showZero color="purple" />
                  </Space>
                }
                key="permissions"
              >
                {permissions.length ? (
                  <List
                    size="small"
                    dataSource={permissions}
                    grid={{ gutter: 8, column: 3, xs: 1, sm: 2, md: 3, lg: 3 }}
                    renderItem={item => (
                      <List.Item>
                        <Tag color="default">{item}</Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No permissions assigned.</Text>
                )}
              </Collapse.Panel>
            </Collapse>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <UpdatePasswordCard />
        </Col>
      </Row>
    </div>
  );
}
