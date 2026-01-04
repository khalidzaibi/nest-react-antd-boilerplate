import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ThemeKey } from '@/themePresets';
import { isDarkTheme } from '@/themePresets';

interface ThemeSettings {
  themeKey: ThemeKey;
  primaryColor: string | null;
  borderRadius: number | null;
  spacingMode: 'compact' | 'small' | 'medium' | 'large';
}

interface State extends ThemeSettings {
  loading: boolean;
}

const THEME_STORAGE_KEY = 'themeSettings';
const isBrowser = typeof window !== 'undefined';

const getSystemTheme = (): ThemeKey => {
  if (!isBrowser || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const loadThemeSettings = (): ThemeSettings => {
  if (!isBrowser) {
    return {
      themeKey: 'light',
      primaryColor: null,
      borderRadius: null,
      spacingMode: 'small',
    };
  }
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) {
      return {
        themeKey: getSystemTheme(),
        primaryColor: null,
        borderRadius: null,
        spacingMode: 'small',
      };
    }
    const parsed = JSON.parse(raw);
    return {
      themeKey: parsed.themeKey ?? getSystemTheme(),
      primaryColor: parsed.primaryColor ?? null,
      borderRadius: typeof parsed.borderRadius === 'number' ? parsed.borderRadius : null,
      spacingMode: parsed.spacingMode || 'small',
    };
  } catch {
    return {
      themeKey: getSystemTheme(),
      primaryColor: null,
      borderRadius: null,
      spacingMode: 'small',
    };
  }
};

const saveThemeSettings = (settings: ThemeSettings) => {
  if (!isBrowser) return;
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
};

const applyThemeToBody = (themeKey: ThemeKey) => {
  if (typeof document === 'undefined') return;
  const body = document.body;
  if (isDarkTheme(themeKey)) {
    body.setAttribute('theme-mode', 'dark');
  } else {
    body.removeAttribute('theme-mode');
  }
};

const storedSettings = loadThemeSettings();
applyThemeToBody(storedSettings.themeKey);

const initialState: State = {
  ...storedSettings,
  loading: false,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setGlobalState(state, action: PayloadAction<Partial<State>>) {
      Object.assign(state, action.payload);

      const nextSettings: ThemeSettings = {
        themeKey: action.payload.themeKey ?? state.themeKey,
        primaryColor: action.payload.primaryColor ?? state.primaryColor ?? null,
        borderRadius:
          action.payload.borderRadius !== undefined ? action.payload.borderRadius : (state.borderRadius ?? null),
        spacingMode: action.payload.spacingMode ?? state.spacingMode ?? 'medium',
      };

      applyThemeToBody(nextSettings.themeKey);
      saveThemeSettings(nextSettings);
    },
  },
});

export const { setGlobalState } = globalSlice.actions;

export default globalSlice.reducer;
