import { useState } from 'react';
import { Drawer, Upload, Typography, Button, Space, Descriptions, Tag, theme } from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  InboxOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  SyncOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps, RcFile } from 'antd/es/upload/interface';
import AxiosInstance from '@/stores/helpers/AxiosInstance';
import { feedback } from '@/lib/feedback';
import { useUserHook } from './hooks/userHook';

const ImportUsersDrawer: React.FC = () => {
  const { token } = theme.useToken();
  const { importDrawerModel, setImportDrawerModel, getUsers } = useUserHook();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [errorFile, setErrorFile] = useState<any | null>(null);

  const handleClose = () => {
    if (uploading) return;
    setFileList([]);
    setImportSummary(null);
    setImportErrors([]);
    setErrorFile(null);
    setImportDrawerModel(false);
  };

  const uploadProps: UploadProps = {
    multiple: false,
    accept: '.csv',
    fileList,
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      return true;
    },
    onChange: info => {
      const latestFile = info.fileList.slice(-1);
      setFileList(latestFile);
    },
    maxCount: 1,
  };

  const handleUpload = async () => {
    if (!fileList.length || !fileList[0].originFileObj) {
      feedback.error('Please select a CSV file to import.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj as RcFile);

    try {
      setUploading(true);
      setImportSummary(null);
      setImportErrors([]);
      setErrorFile(null);
      const res = await AxiosInstance.post('/users/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const payload = res?.data?.data ?? res?.data ?? {};
      setImportSummary(payload?.summary || null);
      setImportErrors(Array.isArray(payload?.errors) ? payload.errors : []);
      setErrorFile(payload?.errorFile || null);
      setFileList([]);
      getUsers();
    } catch (error) {
      console.error('User import failed', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      setDownloadingSample(true);
      const res = await AxiosInstance.get('/users/import/sample', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'user-import-sample.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Sample download failed', error);
      feedback.error('Could not download the sample file.');
    } finally {
      setDownloadingSample(false);
    }
  };

  const downloadErrorFile = () => {
    if (!errorFile) return;
    const mime = errorFile.contentType || 'text/csv';
    const filename = errorFile.filename || 'user-import-errors.csv';
    const content = errorFile.data || errorFile.content || errorFile.buffer;

    let blob: Blob | null = null;
    if (content instanceof Blob) {
      blob = content;
    } else if (typeof content === 'string') {
      try {
        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i += 1) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
      } catch {
        blob = null;
      }
    } else if (Array.isArray(content)) {
      blob = new Blob([new Uint8Array(content)], { type: mime });
    } else if (content instanceof ArrayBuffer) {
      blob = new Blob([content], { type: mime });
    }

    if (!blob) {
      feedback.error('Error file is not available to download.');
      return;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const palette = {
    base: token.colorText,
    created: (importSummary?.created || 0) > 0 ? token.colorSuccess : token.colorTextTertiary,
    updated: (importSummary?.updated || 0) > 0 ? token.colorInfo : token.colorTextTertiary,
    failed: (importSummary?.failed || 0) > 0 ? token.colorError : token.colorTextTertiary,
  };
  const summaryBackground = (importSummary?.failed || 0) > 0 ? token.colorErrorBg : token.colorSuccessBg;

  return (
    <Drawer
      title="Import Users"
      width={window.innerWidth > 768 ? 520 : '100%'}
      open={importDrawerModel}
      onClose={handleClose}
      destroyOnHidden
      maskClosable={!uploading}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Typography.Paragraph type="secondary">
          Upload a CSV file using the template format to import users. Only one file can be uploaded at a time.
        </Typography.Paragraph>
        <Upload.Dragger {...uploadProps} disabled={uploading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
          <p className="ant-upload-hint">We will import the file after you click Import Users.</p>
        </Upload.Dragger>
        <div className="flex justify-between items-center gap-2">
          <Button icon={<DownloadOutlined />} onClick={handleDownloadSample} loading={downloadingSample}>
            Download sample file
          </Button>
          <Space>
            <Button onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="primary" icon={<UploadOutlined />} loading={uploading} onClick={handleUpload}>
              Import Users
            </Button>
          </Space>
        </div>
        {importSummary && (
          <div className="rounded-lg p-4" style={{ background: summaryBackground }}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                {importSummary?.failed ? (
                  <CloseCircleTwoTone twoToneColor={palette.failed} />
                ) : (
                  <CheckCircleTwoTone twoToneColor={palette.created} />
                )}
                <div>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    Import summary
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {importSummary?.failed ? 'Resolve errors below.' : 'All records processed successfully.'}
                  </Typography.Text>
                </div>
              </div>
              {errorFile && (
                <Button icon={<DownloadOutlined />} type="default" size="small" onClick={downloadErrorFile}>
                  Download error file
                </Button>
              )}
            </div>
            <Descriptions size="small" bordered column={1} contentStyle={{}} labelStyle={{ fontWeight: 600 }}>
              <Descriptions.Item label="Total processed">
                <Space size={6} align="center" style={{ color: palette.base }}>
                  <SyncOutlined spin style={{ color: palette.base }} />
                  <Typography.Text style={{ color: palette.base }}>{importSummary?.total ?? 0}</Typography.Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                <Space size={6} align="center">
                  <CheckCircleTwoTone twoToneColor={palette.created} />
                  <Typography.Text style={{ color: palette.created }}>{importSummary?.created ?? 0}</Typography.Text>
                  <Tag color={importSummary?.created ? token.colorSuccess : token.colorBorder}>new</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Updated">
                <Space size={6} align="center">
                  <SyncOutlined style={{ color: palette.updated }} />
                  <Typography.Text style={{ color: palette.updated }}>{importSummary?.updated ?? 0}</Typography.Text>
                  <Tag color={importSummary?.updated ? token.colorInfo : token.colorBorder}>touched</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Failed">
                <Space size={6} align="center">
                  <CloseCircleTwoTone twoToneColor={palette.failed} />
                  <Typography.Text style={{ color: palette.failed }}>{importSummary?.failed ?? 0}</Typography.Text>
                  <Tag color={importSummary?.failed ? token.colorError : token.colorBorder}>needs fix</Tag>
                </Space>
              </Descriptions.Item>
            </Descriptions>
            {importErrors?.length ? (
              <Typography.Paragraph type="danger" style={{ margin: 0 }}>
                {importErrors.length} row(s) failed. Download the error file to see details.
              </Typography.Paragraph>
            ) : (
              <Typography.Paragraph type="success" style={{ margin: 0 }}>
                No errors reported for this upload.
              </Typography.Paragraph>
            )}
          </div>
        )}
      </Space>
    </Drawer>
  );
};

export default ImportUsersDrawer;
