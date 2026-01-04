import { useMemo } from 'react';
import { Button, Divider, Flex, Input, Radio, Slider, Space, Typography, theme as antdTheme } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { ThemeKey } from '@/themePresets';
import { themePresets, isDarkTheme } from '@/themePresets';
import { setGlobalState } from '@/stores/global.store';

const ThemeCustomizer = () => {
  const { token } = antdTheme.useToken();
  const { themeKey, primaryColor, borderRadius, spacingMode } = useSelector((state: any) => state.global);
  const dispatch = useDispatch();
  const cardRadius = typeof token.borderRadiusLG === 'number' ? token.borderRadiusLG : 12;
  const smallRadius = typeof token.borderRadius === 'number' ? token.borderRadius : 8;

  const options = useMemo(
    () =>
      (Object.keys(themePresets) as ThemeKey[]).map(key => ({
        label: themePresets[key].name,
        value: key,
        color: themePresets[key].token.colorPrimary,
      })),
    [],
  );

  const applyPreset = (key: ThemeKey) => {
    dispatch(setGlobalState({ themeKey: key }));
  };

  const handlePrimaryChange = (value: string) => {
    dispatch(setGlobalState({ primaryColor: value || null }));
  };

  const handleRadiusChange = (value: number) => {
    dispatch(setGlobalState({ borderRadius: value }));
  };

  const handleSpacingChange = (value: 'compact' | 'small' | 'medium' | 'large') => {
    dispatch(setGlobalState({ spacingMode: value }));
  };

  const resetTweaks = () => {
    dispatch(setGlobalState({ themeKey: 'light', primaryColor: null, borderRadius: null, spacingMode: 'small' }));
  };

  const activePrimary = primaryColor || themePresets[themeKey as ThemeKey]?.token?.colorPrimary;
  const primaryTone = activePrimary || token.colorPrimary;
  const activeRadius =
    typeof borderRadius === 'number'
      ? borderRadius
      : (themePresets[themeKey as ThemeKey]?.token?.borderRadius ?? cardRadius);

  const colorSwatches = [
    '#ED4192',
    '#1677ff',
    '#9254de',
    '#722ed1',
    '#eb2f96',
    '#f5222d',
    '#fa8c16',
    '#faad14',
    '#52c41a',
    '#13c2c2',
  ];

  const renderPreview = (color: string, dark: boolean) => (
    <div
      style={{
        width: 80,
        height: 60,
        borderRadius: cardRadius,
        background: dark ? '#2b2b2b' : '#f5f7fb',
        position: 'relative',
        overflow: 'hidden',
        border: `2px solid ${color}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 12,
          borderRadius: cardRadius,
          background: dark ? '#1c1c1c' : '#ffffff',
          boxShadow: dark ? '0 8px 20px rgba(0,0,0,0.35)' : '0 8px 20px rgba(0,0,0,0.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          width: 36,
          height: 12,
          borderRadius: smallRadius,
          background: color,
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        background: token.colorBgContainer,
        borderRadius: cardRadius,
        overflow: 'hidden',
        boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
      }}
    >
      <div
        style={{
          padding: '18px 20px',
          background: `linear-gradient(135deg, ${primaryTone}33 0%, ${token.colorBgContainer} 100%)`,
          color: token.colorTextHeading,
        }}
      >
        <Typography.Title level={4} style={{ color: token.colorTextHeading, margin: 0 }}>
          Customize Theme
        </Typography.Title>
        <Typography.Paragraph style={{ color: token.colorTextSecondary, margin: 0, fontSize: 12 }}>
          Pick a preset or fine-tune colors, corners, and spacing.
        </Typography.Paragraph>
      </div>

      <div style={{ padding: 20 }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: 10 }}>
          Theme
        </Typography.Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
          }}
        >
          {options.map(opt => {
            const selected = themeKey === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => applyPreset(opt.value)}
                style={{
                  padding: 12,
                  borderRadius: cardRadius,
                  border: selected ? `2px solid ${primaryTone}` : `1px solid ${token.colorBorderSecondary}`,
                  background: token.colorBgContainer,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                {renderPreview(opt.color, isDarkTheme(opt.value))}
                <Typography.Text style={{ fontSize: 12 }}>{opt.label}</Typography.Text>
              </button>
            );
          })}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography.Text strong style={{ color: token.colorText }}>
            Primary Color
          </Typography.Text>
          <Flex align="center" gap={10} wrap style={{ rowGap: 10 }}>
            {colorSwatches.map(color => (
              <button
                key={color}
                onClick={() => handlePrimaryChange(color)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border:
                    activePrimary?.toLowerCase() === color.toLowerCase()
                      ? `2px solid ${token.colorText}`
                      : `1px solid ${token.colorBorderSecondary}`,
                  background: color,
                  cursor: 'pointer',
                }}
              />
            ))}
            <Input
              type="color"
              value={activePrimary}
              onChange={e => handlePrimaryChange(e.target.value)}
              style={{ padding: 0, height: 32, width: 60 }}
            />
            <Input value={activePrimary} onChange={e => handlePrimaryChange(e.target.value)} style={{ width: 110 }} />
          </Flex>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography.Text strong>Border Radius</Typography.Text>
          <Slider
            min={0}
            max={16}
            step={1}
            value={activeRadius}
            onChange={handleRadiusChange}
            tooltip={{ formatter: v => `${v}px` }}
          />
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Typography.Text strong>Compact</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
              Reduce spacing
            </Typography.Paragraph>
          </div>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            value={spacingMode || 'compact'}
            onChange={e => handleSpacingChange(e.target.value as any)}
          >
            <Radio.Button value="compact">Compact</Radio.Button>
            <Radio.Button value="small">Small</Radio.Button>
            <Radio.Button value="medium">Medium</Radio.Button>
            <Radio.Button value="large">Large</Radio.Button>
          </Radio.Group>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={resetTweaks} size="small">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
