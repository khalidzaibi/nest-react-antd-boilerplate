import './SpecialPermissionsDrawer.less';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { App, Button, Checkbox, Drawer, Empty, Spin, Tag, Typography, Space, Divider } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useUserHook } from '../hooks/userHook';
import { usePermissionHook } from '@/pages/rbac/hooks/permissionHook';

type PermissionRecord = {
  key: string;
  label?: string;
  description?: string;
  module?: string;
};

type PermissionGroup = Record<string, PermissionRecord[]>;

const normalizePermissionList = (payload: any): PermissionRecord[] => {
  if (!payload) return [];
  const raw =
    Array.isArray(payload?.data) || Array.isArray(payload) ? payload?.data || payload : payload?.data || payload;

  const list: PermissionRecord[] = [];

  if (Array.isArray(raw)) {
    raw.forEach(item => {
      if (!item) return;
      const key = item.key || item.permission || item.id;
      if (!key) return;
      const module = item.module || key.split('.')?.[0] || 'general';
      list.push({
        key,
        label: item.label || key,
        description: item.description,
        module,
      });
    });
    return list;
  }

  if (typeof raw === 'object') {
    Object.entries(raw).forEach(([module, values]) => {
      if (!Array.isArray(values)) return;
      values.forEach(item => {
        if (!item) return;
        const key = item.key || item.permission || item.id;
        if (!key) return;
        list.push({
          key,
          label: item.label || key,
          description: item.description,
          module: module || item.module || key.split('.')?.[0] || 'general',
        });
      });
    });
  }

  return list;
};

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every(key => setB.has(key));
};

const SpecialPermissionsDrawer = () => {
  const { message } = App.useApp();
  const {
    selectedModel,
    specialPermissionsDrawer,
    setSpecialPermissionsDrawer,
    setEditModel,
    getUserPermissions,
    updateUserSpecialPermissions,
    rolePermissions,
    specialPermissions,
  } = useUserHook();
  const { getAllGroupedPermissions } = usePermissionHook();
  const [allPermissions, setAllPermissions] = useState<PermissionRecord[]>([]);
  const [rolePermissionKeys, setRolePermissionKeys] = useState<string[]>([]);
  const [specialPermissionKeys, setSpecialPermissionKeys] = useState<string[]>([]);
  const [initialSpecialKeys, setInitialSpecialKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const roleSet = useMemo(() => new Set(rolePermissionKeys), [rolePermissionKeys]);
  const selectedSet = useMemo(
    () => new Set([...rolePermissionKeys, ...specialPermissionKeys]),
    [rolePermissionKeys, specialPermissionKeys],
  );

  const groupedPermissions: PermissionGroup = useMemo(() => {
    return allPermissions.reduce<PermissionGroup>((acc, perm) => {
      const module = perm.module || perm.key.split('.')?.[0] || 'general';
      if (!acc[module]) acc[module] = [];
      acc[module].push(perm);
      return acc;
    }, {});
  }, [allPermissions]);

  useEffect(() => {
    if (!specialPermissionsDrawer || !selectedModel?.id) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [grouped, _] = await Promise.all([getAllGroupedPermissions(), getUserPermissions(selectedModel.id)]);
        setAllPermissions(normalizePermissionList(grouped?.data || grouped));
      } catch (error) {
        console.error('Failed to load permissions', error);
        message.error('Unable to load permissions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [specialPermissionsDrawer, selectedModel?.id, getUserPermissions, message]);

  useEffect(() => {
    if (Array.isArray(rolePermissions)) {
      setRolePermissionKeys(rolePermissions);
    }
    if (Array.isArray(specialPermissions)) {
      setSpecialPermissionKeys(specialPermissions);
      setInitialSpecialKeys(specialPermissions);
    }
  }, [rolePermissions, specialPermissions]);

  const handleClose = useCallback(() => {
    if (saving) return;
    setSpecialPermissionsDrawer(false);
    setEditModel(null);
  }, [saving, setEditModel, setSpecialPermissionsDrawer]);

  const handleToggle = (permissionKey: string, checked: boolean) => {
    if (roleSet.has(permissionKey)) return;
    setSpecialPermissionKeys(prev => {
      if (checked) {
        if (prev.includes(permissionKey)) return prev;
        return [...prev, permissionKey];
      }
      return prev.filter(key => key !== permissionKey);
    });
  };

  const hasChanges = useMemo(
    () => !arraysEqual(initialSpecialKeys.slice().sort(), specialPermissionKeys.slice().sort()),
    [initialSpecialKeys, specialPermissionKeys],
  );

  const handleSave = async () => {
    if (!selectedModel?.id) return;
    setSaving(true);
    try {
      await updateUserSpecialPermissions({ id: selectedModel.id, specialPermissions: specialPermissionKeys });
      setInitialSpecialKeys(specialPermissionKeys);
      // handleClose();
    } catch (error: any) {
      console.error('Failed to update special permissions', error);
      const errMessage = error?.message || error?.response?.data?.message || 'Unable to update special permissions.';
      message.error(errMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderPermission = (perm: PermissionRecord) => {
    const isRolePermission = roleSet.has(perm.key);
    const isChecked = selectedSet.has(perm.key);
    return (
      <div
        key={perm.key}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Checkbox
          checked={isChecked}
          disabled={isRolePermission || loading}
          onChange={(event: CheckboxChangeEvent) => handleToggle(perm.key, event.target.checked)}
        >
          <Space size="small">
            <span>{perm.label || perm.key}</span>
            {isRolePermission && <Tag color="gold">Role</Tag>}
          </Space>
        </Checkbox>
      </div>
    );
  };

  return (
    <Drawer
      title={
        <Space direction="vertical" size={0}>
          <span>Assign Special Permissions</span>
          <Typography.Text type="secondary">{selectedModel?.name || selectedModel?.email}</Typography.Text>
        </Space>
      }
      width={window.innerWidth > 768 ? '50%' : '100%'}
      open={specialPermissionsDrawer}
      destroyOnHidden
      onClose={handleClose}
      extra={
        <Space>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSave} loading={saving} disabled={!hasChanges || loading}>
            Save
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {allPermissions.length === 0 ? (
          <Empty description="No permissions available" />
        ) : (
          Object.entries(groupedPermissions)
            .sort(([moduleA], [moduleB]) => moduleA.localeCompare(moduleB))
            .map(([module, perms]) => (
              <div key={module} style={{ marginBottom: 16 }}>
                <Divider orientation="left" style={{ margin: '12px 0' }}>
                  <Typography.Text strong>{module.toUpperCase()}</Typography.Text>
                </Divider>
                <div className="permissions-grid">{perms.map(renderPermission)}</div>
              </div>
            ))
        )}
      </Spin>
    </Drawer>
  );
};

export default SpecialPermissionsDrawer;
