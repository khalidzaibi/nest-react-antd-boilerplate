import { theme as antdTheme } from 'antd';

export type ThemeKey = 'light' | 'dark' | 'blossom' | 'blossomDark' | 'sunset' | 'sunsetDark';

export const themePresets: Record<
  ThemeKey,
  {
    name: string;
    algorithm: typeof antdTheme.defaultAlgorithm;
    token: Record<string, any>;
  }
> = {
  light: {
    name: 'Light',
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#13c2c2',
      borderRadius: 0,
    },
  },
  dark: {
    name: 'Dark',
    algorithm: antdTheme.darkAlgorithm,
    token: {
      colorPrimary: '#13c2c2',
      borderRadius: 0,
    },
  },
  blossom: {
    name: 'Blossom',
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#ED4192',
      // colorInfo: '#ED4192',
      // colorSuccess: '#52c41a',
      // colorWarning: '#faad14',
      // colorError: '#f61014ff',
      // colorBgBase: '#ffffff',
      borderRadius: 6,
    },
  },
  blossomDark: {
    name: 'Blossom Dark',
    algorithm: antdTheme.darkAlgorithm,
    token: {
      colorPrimary: '#ED4192',
      // colorInfo: '#ED4192',
      // colorSuccess: '#52c41a',
      // colorWarning: '#faad14',
      // colorError: '#ff4d4f',
      // colorBgBase: '#141414',
      borderRadius: 6,
    },
  },
  sunset: {
    name: 'Sunset',
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#fa541c',
      // colorWarning: '#fa8c16',
      // colorError: '#ff4d4f',
      // colorSuccess: '#52c41a',
      borderRadius: 8,
    },
  },
  sunsetDark: {
    name: 'Sunset Dark',
    algorithm: antdTheme.darkAlgorithm,
    token: {
      colorPrimary: '#fa541c',
      // colorWarning: '#fa8c16',
      // colorError: '#ff4d4f',
      // colorSuccess: '#52c41a',
      borderRadius: 8,
    },
  },
};

export const isDarkTheme = (key: ThemeKey) => key === 'dark' || key === 'blossomDark' || key === 'sunsetDark';
