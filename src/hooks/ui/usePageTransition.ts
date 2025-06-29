/**
 * 页面过渡动画Hook
 * 基于AnimationService提供标准化的页面切换动画
 * 
 * @description 负责处理：
 * - 页面切换动画状态管理
 * - 动画序列控制
 * - 手势响应动画
 * - 性能优化
 */

import { useCallback, useState } from 'react';
import { useSpring, SpringValue } from '@react-spring/web';
import { AnimationService, SlideDirection, AnimationState } from '../../services/animation';
import { useAppStoreSelectors } from '../../stores/useAppStore';
import createLogger from '../../utils/logger';

const logger = createLogger('usePageTransition');

/**
 * 页面过渡Hook接口
 */
export interface UsePageTransitionReturn {
  // 动画状态
  springProps: {
    opacity: SpringValue<number>;
    transform: SpringValue<string>;
  };
  isTransitioning: boolean;
  
  // 操作方法
  startTransition: (direction: SlideDirection, onComplete?: () => void) => Promise<void>;
  resetAnimation: () => void;
  
  // 手势相关
  startGestureTransition: (direction: SlideDirection, progress: number) => void;
  updateGestureProgress: (progress: number, direction: SlideDirection) => void;
  completeGestureTransition: (direction: SlideDirection) => Promise<void>;
  cancelGestureTransition: () => Promise<void>;
}

/**
 * 页面过渡动画Hook
 */
export const usePageTransition = (): UsePageTransitionReturn => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gestureInProgress, setGestureInProgress] = useState(false);
  
  // 获取当前动画状态（避免重复过渡）
  const globalIsTransitioning = useAppStoreSelectors.useIsTransitioning();
  
  // 创建Spring动画
  const [springProps, api] = useSpring(() => ({
    opacity: 1,
    transform: 'translateX(0%) translateY(0%)',
    config: AnimationService.ANIMATION_CONFIGS.smooth
  }));

  /**
   * 开始页面过渡动画
   */
  const startTransition = useCallback(async (
    direction: SlideDirection, 
    onComplete?: () => void
  ): Promise<void> => {
    if (isTransitioning || globalIsTransitioning) {
      logger.warn('Transition already in progress, skipping');
      return;
    }

    setIsTransitioning(true);
    logger.info('Starting page transition:', direction);

    try {
      // 第一阶段：滑出动画
      const slideOutState = AnimationService.createPageTransitionState('slideOut', direction);
      await api.start({
        ...slideOutState.state,
        config: slideOutState.config
      });

      // 执行内容切换回调
      if (onComplete) {
        onComplete();
      }

      // 设置滑入初始位置
      const slideInInitialDirection = direction === 'left' ? 'right' : 'left';
      const slideInInitialState = AnimationService.createPageTransitionState('slideOut', slideInInitialDirection);
      api.set({
        ...slideInInitialState.state
      });

      // 第二阶段：滑入动画
      const slideInState = AnimationService.createPageTransitionState('slideIn', direction);
      await api.start({
        ...slideInState.state,
        config: slideInState.config
      });

      logger.info('Page transition completed:', direction);
    } catch (error) {
      logger.error('Page transition failed:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [api, isTransitioning, globalIsTransitioning]);

  /**
   * 重置动画到初始状态
   */
  const resetAnimation = useCallback(() => {
    const idleState = AnimationService.createPageTransitionState('idle');
    api.set({
      ...idleState.state
    });
    setIsTransitioning(false);
    setGestureInProgress(false);
    logger.info('Animation reset to idle state');
  }, [api]);

  /**
   * 开始手势过渡动画
   */
  const startGestureTransition = useCallback((direction: SlideDirection, progress: number) => {
    if (isTransitioning) return;
    
    setGestureInProgress(true);
    
    // 根据手势进度计算变换值
    const maxTransform = 100; // 最大变换百分比
    const transformValue = progress * maxTransform;
    const transformDirection = direction === 'left' ? -transformValue : transformValue;
    
    api.start({
      opacity: Math.max(0.3, 1 - progress * 0.7), // 保持最小透明度
      transform: `translateX(${transformDirection}%)`,
      config: AnimationService.getGestureAnimationConfig(),
      immediate: true // 立即响应手势
    });
  }, [api, isTransitioning]);

  /**
   * 更新手势进度
   */
  const updateGestureProgress = useCallback((progress: number, direction: SlideDirection) => {
    if (!gestureInProgress || isTransitioning) return;
    
    const maxTransform = 100;
    const transformValue = Math.min(progress, 1) * maxTransform;
    const transformDirection = direction === 'left' ? -transformValue : transformValue;
    
    api.start({
      opacity: Math.max(0.3, 1 - Math.min(progress, 1) * 0.7),
      transform: `translateX(${transformDirection}%)`,
      config: AnimationService.getGestureAnimationConfig(),
      immediate: true
    });
  }, [api, gestureInProgress, isTransitioning]);

  /**
   * 完成手势过渡动画
   */
  const completeGestureTransition = useCallback(async (direction: SlideDirection): Promise<void> => {
    if (!gestureInProgress) return;
    
    setGestureInProgress(false);
    setIsTransitioning(true);
    
    try {
      // 完成滑出动画
      const slideOutState = AnimationService.createPageTransitionState('slideOut', direction);
      await api.start({
        ...slideOutState.state,
        config: slideOutState.config
      });
      
      logger.info('Gesture transition completed:', direction);
    } catch (error) {
      logger.error('Failed to complete gesture transition:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [api, gestureInProgress]);

  /**
   * 取消手势过渡动画
   */
  const cancelGestureTransition = useCallback(async (): Promise<void> => {
    if (!gestureInProgress) return;
    
    setGestureInProgress(false);
    
    try {
      // 恢复到初始状态
      const idleState = AnimationService.createPageTransitionState('idle');
      await api.start({
        ...idleState.state,
        config: AnimationService.ANIMATION_CONFIGS.quick
      });
      
      logger.info('Gesture transition cancelled');
    } catch (error) {
      logger.error('Failed to cancel gesture transition:', error);
    }
  }, [api, gestureInProgress]);

  return {
    // 动画状态
    springProps,
    isTransitioning: isTransitioning || gestureInProgress,
    
    // 操作方法
    startTransition,
    resetAnimation,
    
    // 手势相关
    startGestureTransition,
    updateGestureProgress,
    completeGestureTransition,
    cancelGestureTransition
  };
};

export default usePageTransition;