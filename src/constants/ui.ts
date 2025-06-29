/**
 * UI相关常量
 * 统一定义应用中使用的UI参数
 */

// 断点常量
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1440
} as const;

// Z-Index层级常量
export const Z_INDEX = {
  BACKGROUND: 0,
  CONTENT: 1,
  OVERLAY: 10,
  HEADER: 50,
  MODAL: 100,
  TOAST: 200,
  TOOLTIP: 300
} as const;

// 间距常量
export const SPACING = {
  XS: '0.25rem',
  SM: '0.5rem',
  MD: '1rem',
  LG: '1.5rem',
  XL: '2rem',
  XXL: '3rem'
} as const;

// 圆角常量
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.25rem',
  MD: '0.5rem',
  LG: '0.75rem',
  XL: '1rem',
  FULL: '50%'
} as const;

// 阴影常量
export const BOX_SHADOW = {
  NONE: 'none',
  SM: '0 1px 3px rgba(0, 0, 0, 0.1)',
  MD: '0 4px 16px rgba(0, 0, 0, 0.1)',
  LG: '0 8px 32px rgba(0, 0, 0, 0.1)',
  XL: '0 16px 64px rgba(0, 0, 0, 0.1)'
} as const;