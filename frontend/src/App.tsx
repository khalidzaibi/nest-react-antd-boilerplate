import 'dayjs/locale/zh-cn';

import { ConfigProvider, Spin, theme as antdTheme, App as AntdApp } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import dayjs from 'dayjs';
import { Suspense, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { HistoryRouter, history } from '@/routes/history';

import { LocaleFormatter, localeConfig } from './locales';
import RenderRouter from './routes/ProtectedRoutes';
import FeedbackProvider from './providers/FeedbackProvider';
import { setGlobalState } from './stores/global.store';
import { themePresets, ThemeKey, isDarkTheme } from './themePresets';

const App: React.FC = () => {
  const { locale } = useSelector((state: any) => state.user);
  const { themeKey, primaryColor, borderRadius, compact, spacingMode, loading } = useSelector(
    (state: any) => state.global,
  );

  const dispatch = useDispatch();

  const hasStoredTheme = typeof window !== 'undefined' && localStorage.getItem('theme');

  /** watch system theme change only when user hasn't selected a preset */
  useEffect(() => {
    if (hasStoredTheme) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    function matchMode(e: MediaQueryListEvent) {
      dispatch(setGlobalState({ themeKey: e.matches ? ('dark' as ThemeKey) : ('light' as ThemeKey) }));
    }

    mql.addEventListener('change', matchMode);
    return () => mql.removeEventListener('change', matchMode);
  }, [dispatch, hasStoredTheme]);

  // set the locale for the user
  // more languages options can be added here
  useEffect(() => {
    if (locale === 'en_US') {
      dayjs.locale('en');
    } else if (locale === 'zh_CN') {
      dayjs.locale('zh-cn');
    }
  }, [locale]);

  /**
   * handler function that passes locale
   * information to ConfigProvider for
   * setting language across text components
   */
  const getAntdLocale = () => {
    if (locale === 'en_US') {
      return enUS;
    } else if (locale === 'zh_CN') {
      return zhCN;
    }
  };
  // #ED4192
  // #13c2c2
  const preset = themePresets[themeKey as ThemeKey] || themePresets.light;
  const resolvedPrimary = primaryColor || preset.token.colorPrimary;
  const resolvedRadius = typeof borderRadius === 'number' ? borderRadius : preset.token.borderRadius;
  const spacing = spacingMode || (compact ? 'compact' : 'medium');
  const algorithms = spacing === 'compact' ? [preset.algorithm, antdTheme.compactAlgorithm] : [preset.algorithm];
  const componentSize =
    spacing === 'compact' || spacing === 'small' ? 'small' : spacing === 'large' ? 'large' : 'middle';

  return (
    <ConfigProvider
      locale={getAntdLocale()}
      componentSize={componentSize}
      theme={{
        token: {
          // ...preset.token,
          colorPrimary: resolvedPrimary,
          colorLink: resolvedPrimary,
          colorLinkHover: preset.token.colorLinkHover || undefined,
          colorLinkActive: preset.token.colorLinkActive || undefined,
          borderRadius: resolvedRadius,
        },
        components: { Modal: { borderRadiusLG: 0, borderRadiusSM: 0, borderRadius: 0 } },
        algorithm: algorithms,
      }}
    >
      <AntdApp>
        <FeedbackProvider />
        <IntlProvider locale={locale.split('_')[0]} messages={localeConfig['en_US']}>
          <HistoryRouter history={history}>
            <Suspense fallback={null}>
              {/* <Spin
              spinning={loading}
              className="app-loading-wrapper"
              style={{
                backgroundColor: isDarkTheme(themeKey as ThemeKey)
                  ? 'rgba(0, 0, 0, 0.44)'
                  : 'rgba(255, 255, 255, 0.44)',
              }}
              tip={<LocaleFormatter id="gloabal.tips.loading" />}
            ></Spin> */}
              <RenderRouter />
            </Suspense>
          </HistoryRouter>
        </IntlProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
