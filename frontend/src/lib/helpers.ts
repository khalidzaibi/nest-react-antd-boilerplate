import dayjs, { Dayjs } from 'dayjs';
export const DEFAULT_PER_PAGE = 20;
export const DEFAULT_PAGE = 1;
export const throttle = (func: (...args: unknown[]) => void, limit: number): ((...args: unknown[]) => void) => {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return function (this: unknown, ...args: unknown[]) {
    if (lastRan === null) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      if (lastFunc !== null) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(
        () => {
          if (Date.now() - (lastRan as number) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - (lastRan as number)),
      );
    }
  };
};

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function uid(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}

export function getInitials(name: string | null | undefined, count?: number): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase());

  return count && count > 0 ? initials.slice(0, count).join('') : initials.join('');
}
export function getFirstName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const parts = name.trim().split(' ').filter(Boolean);
  return parts.length > 0 ? parts[0] : '';
}

export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = import.meta.env.BASE_URL;

  if (baseUrl && baseUrl !== '/') {
    return import.meta.env.BASE_URL + pathname;
  } else {
    return pathname;
  }
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;

  return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? 's' : ''} ago`;
}

export function formatDate(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

export const objectLength = (obj?: Record<string, any> | null): any => {
  if (!obj) return null;
  return Object.keys(obj).length;
};

export function capitalizeWords(value?: string | null): string {
  if (!value) return '';
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function saveFormatDateOnly(date?: dayjs.Dayjs | Date | string): string | null | undefined {
  if (!date) return undefined;
  return dayjs(date).format('YYYY-MM-DD');
}
export function toDayjs(date?: string | Date | Dayjs | null): Dayjs | undefined {
  if (!date) return undefined;

  const parsed = dayjs(date);
  return parsed.isValid() ? parsed : undefined;
}

export function downloadFile(url: string) {
  // const fileUrl = `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/public/${url}`;
  const origin = new URL(import.meta.env.VITE_API_URL).origin;
  const fileUrl = `${origin}/public/${url.replace(/^\/+/, '')}`;
  window.open(fileUrl, '_blank');
}

export function toPublicUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  try {
    const origin = new URL(import.meta.env.VITE_API_URL).origin;
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.replace(/^\/+/, '');
    return `${origin}/public/${normalized}`;
  } catch {
    return path || undefined;
  }
}

export function formatAndCapitalize(input: string): string {
  if (!input) return '';

  return input
    .split('-') // split by hyphens
    .map(word => {
      // if the word is all letters, capitalize first letter
      if (/^[a-zA-Z]+$/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      // if it starts with a digit, just uppercase all (e.g. "4g" -> "4G")
      return word.toUpperCase();
    })
    .join(' ');
}

export function truncateText(value?: string | null, max = 50): string | undefined | null {
  if (!value) return value as undefined | null;
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export function toDateValue(value?: string | Dayjs | null): Dayjs | null {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}
