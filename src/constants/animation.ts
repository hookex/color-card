/**
 * 动画相关常量
 * 统一定义应用中使用的动画参数
 */

// 动画时长常量
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 400,
  GESTURE_RESPONSE: 100
} as const;

// 缓动函数常量
export const EASING = {
  EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const;

// 动画延迟常量
export const ANIMATION_DELAY = {
  NONE: 0,
  SHORT: 100,
  MEDIUM: 200,
  LONG: 300
} as const;