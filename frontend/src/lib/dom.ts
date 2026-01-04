import {
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  FileZipOutlined,
} from '@ant-design/icons';

export function getHeight(element: HTMLElement): number {
  if (!element) return 0;

  const styles = window.getComputedStyle(element);

  const height = element.getBoundingClientRect().height;
  const marginTop = parseFloat(styles.marginTop);
  const marginBottom = parseFloat(styles.marginBottom);

  const totalHeight = height + marginTop + marginBottom;

  return totalHeight;
}
export function getIconFromMimeType(mimeType: string) {
  if (!mimeType) return FileUnknownOutlined;

  switch (mimeType) {
    // 🖼️ Images
    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/gif':
    case 'image/webp':
    case 'image/svg+xml':
      return FileImageOutlined;

    // 📄 Word documents
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.oasis.opendocument.text':
      return FileWordOutlined;

    // 🧮 Excel spreadsheets
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.oasis.opendocument.spreadsheet':
      return FileExcelOutlined;

    // 📊 PowerPoint presentations
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.oasis.opendocument.presentation':
      return FilePptOutlined;

    // 📕 PDFs
    case 'application/pdf':
    case 'application/vnd.oasis.opendocument.text-master':
      return FilePdfOutlined;

    // 📦 Archives
    case 'application/zip':
    case 'application/x-zip-compressed':
    case 'application/x-rar-compressed':
    case 'application/x-7z-compressed':
    case 'application/x-tar':
      return FileZipOutlined;

    // 📝 Plain text, JSON, etc.
    case 'text/plain':
    case 'text/html':
    case 'application/json':
      return FileTextOutlined;

    default:
      return FileUnknownOutlined;
  }
}

export const allowedModules = ['users', 'roles', 'permissions', 'options'];
