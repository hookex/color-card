/**
 * 动画服务层 - 统一管理所有动画配置和操作
 * 基于 React Spring 提供标准化的动画预设和工具函数
 * 
 * @description 负责处理应用中所有的动画逻辑，包括：
 * - 标准动画配置预设
 * - 页面切换动画
 * - 交互反馈动画
 * - 手势响应动画
 */

import { SpringConfig } from '@react-spring/web';

/**
 * 标准动画配置预设
 * 提供应用中常用的动画参数组合
 */
export const ANIMATION_CONFIGS = {
  // 快速响应 - 用于按钮点击等即时反馈
  quick: {
    tension: 300,
    friction: 30,
    mass: 0.8,
    clamp: true
  } as SpringConfig,

  // 标准动画 - 用于一般的UI过渡
  standard: {
    tension: 280,
    friction: 60,
    mass: 1,
    clamp: true
  } as SpringConfig,

  // 平滑动画 - 用于页面切换等重要过渡
  smooth: {
    tension: 200,
    friction: 50,
    mass: 1,
    clamp: true
  } as SpringConfig,

  // 弹性动画 - 用于强调性的交互（不使用clamp）
  elastic: {
    tension: 300,
    friction: 40,
    mass: 1.2,
    clamp: false
  } as SpringConfig,

  // 缓慢动画 - 用于复杂内容的过渡
  slow: {
    tension: 150,
    friction: 70,
    mass: 1.5,
    clamp: true
  } as SpringConfig
};

/**
 * 页面切换动画方向类型
 */
export type SlideDirection = 'left' | 'right' | 'up' | 'down';

/**
 * 动画状态类型
 */
export interface AnimationState {
  opacity: number;
  transform: string;
  scale?: number;
}

/**
 * 页面切换动画配置
 */
export interface PageTransitionConfig {
  direction: SlideDirection;
  duration?: number;
  config?: SpringConfig;
}

/**
 * 动画服务类
 * 提供统一的动画操作接口
 */
export class AnimationService {
  /**
   * 获取滑入动画的初始变换值
   * @param direction 滑动方向
   * @returns CSS transform 字符串
   */
  static getSlideInTransform(direction: SlideDirection): string {
    switch (direction) {
      case 'left':
        return 'translateX(100%)';
      case 'right':
        return 'translateX(-100%)';
      case 'up':
        return 'translateY(100%)';
      case 'down':
        return 'translateY(-100%)';
      default:
        return 'translateX(100%)';
    }
  }

  /**
   * 获取滑出动画的目标变换值
   * @param direction 滑动方向
   * @returns CSS transform 字符串
   */
  static getSlideOutTransform(direction: SlideDirection): string {
    switch (direction) {
      case 'left':
        return 'translateX(-100%)';
      case 'right':
        return 'translateX(100%)';
      case 'up':
        return 'translateY(-100%)';
      case 'down':
        return 'translateY(100%)';
      default:
        return 'translateX(-100%)';
    }
  }

  /**
   * 创建页面切换动画状态
   * @param phase 动画阶段：'slideOut' | 'slideIn' | 'idle'
   * @param direction 滑动方向
   * @param config 动画配置
   * @returns 动画状态对象
   */
  static createPageTransitionState(
    phase: 'slideOut' | 'slideIn' | 'idle',
    direction: SlideDirection = 'left',
    config: SpringConfig = ANIMATION_CONFIGS.smooth
  ): { state: AnimationState; config: SpringConfig } {
    let state: AnimationState;

    switch (phase) {
      case 'slideOut':
        state = {
          opacity: 0,
          transform: this.getSlideOutTransform(direction)
        };
        break;
      case 'slideIn':
        state = {
          opacity: 1,
          transform: 'translateX(0%) translateY(0%)'
        };
        break;
      case 'idle':
      default:
        state = {
          opacity: 1,
          transform: 'translateX(0%) translateY(0%)'
        };
        break;
    }

    return { state, config };
  }

  /**
   * 创建缩放动画状态
   * @param phase 动画阶段：'scaleDown' | 'scaleUp' | 'normal'
   * @param config 动画配置
   * @returns 动画状态对象
   */
  static createScaleAnimationState(
    phase: 'scaleDown' | 'scaleUp' | 'normal',
    config: SpringConfig = ANIMATION_CONFIGS.quick
  ): { state: AnimationState; config: SpringConfig } {
    let state: AnimationState;

    switch (phase) {
      case 'scaleDown':
        state = {
          opacity: 0.8,
          transform: 'scale(0.95)',
          scale: 0.95
        };
        break;
      case 'scaleUp':
        state = {
          opacity: 1,
          transform: 'scale(1.05)',
          scale: 1.05
        };
        break;
      case 'normal':
      default:
        state = {
          opacity: 1,
          transform: 'scale(1)',
          scale: 1
        };
        break;
    }

    return { state, config };
  }

  /**
   * 创建淡入淡出动画状态
   * @param phase 动画阶段：'fadeIn' | 'fadeOut' | 'visible'
   * @param config 动画配置
   * @returns 动画状态对象
   */
  static createFadeAnimationState(
    phase: 'fadeIn' | 'fadeOut' | 'visible',
    config: SpringConfig = ANIMATION_CONFIGS.standard
  ): { state: AnimationState; config: SpringConfig } {
    let state: AnimationState;

    switch (phase) {
      case 'fadeOut':
        state = {
          opacity: 0,
          transform: 'translateX(0%) translateY(0%)'
        };
        break;
      case 'fadeIn':
      case 'visible':
      default:
        state = {
          opacity: 1,
          transform: 'translateX(0%) translateY(0%)'
        };
        break;
    }

    return { state, config };
  }

  /**
   * 获取手势响应动画配置
   * 针对触摸交互优化的动画参数
   */
  static getGestureAnimationConfig(): SpringConfig {
    return {
      tension: 400,
      friction: 40,
      mass: 0.8,
      clamp: true
    };
  }

  /**
   * 获取按钮点击反馈动画配置
   */
  static getButtonFeedbackConfig(): SpringConfig {
    return ANIMATION_CONFIGS.quick;
  }

  /**
   * 根据索引变化确定滑动方向
   * @param currentIndex 当前索引
   * @param newIndex 新索引
   * @returns 滑动方向
   */
  static getDirectionFromIndexChange(currentIndex: number, newIndex: number): SlideDirection {
    return newIndex > currentIndex ? 'left' : 'right';
  }

  /**
   * 创建组合动画状态（同时包含多种动画效果）
   * @param effects 动画效果组合
   * @param config 动画配置
   * @returns 动画状态对象
   */
  static createCombinedAnimationState(
    effects: {
      opacity?: number;
      scale?: number;
      translateX?: number;
      translateY?: number;
      rotate?: number;
    },
    config: SpringConfig = ANIMATION_CONFIGS.standard
  ): { state: AnimationState; config: SpringConfig } {
    const transforms: string[] = [];

    if (effects.translateX !== undefined) {
      transforms.push(`translateX(${effects.translateX}%)`);
    }
    if (effects.translateY !== undefined) {
      transforms.push(`translateY(${effects.translateY}%)`);
    }
    if (effects.scale !== undefined) {
      transforms.push(`scale(${effects.scale})`);
    }
    if (effects.rotate !== undefined) {
      transforms.push(`rotate(${effects.rotate}deg)`);
    }

    const state: AnimationState = {
      opacity: effects.opacity ?? 1,
      transform: transforms.length > 0 ? transforms.join(' ') : 'none'
    };

    if (effects.scale !== undefined) {
      state.scale = effects.scale;
    }

    return { state, config };
  }
}

/**
 * 动画工具函数
 */
export const AnimationUtils = {
  /**
   * 延迟执行函数
   * @param ms 延迟时间（毫秒）
   * @returns Promise
   */
  delay: (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * 创建动画序列执行器
   * @param animations 动画数组
   * @returns 执行动画序列的函数
   */
  createSequence: (animations: Array<() => Promise<any>>) => 
    async (): Promise<void> => {
      for (const animation of animations) {
        await animation();
      }
    },

  /**
   * 创建并行动画执行器
   * @param animations 动画数组
   * @returns 执行并行动画的函数
   */
  createParallel: (animations: Array<() => Promise<any>>) => 
    async (): Promise<void> => {
      await Promise.all(animations.map(animation => animation()));
    }
};

export default AnimationService;