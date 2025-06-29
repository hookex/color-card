/**
 * 手势处理Hook
 * 统一管理应用中的各种手势交互
 * 
 * @description 负责处理：
 * - 滑动手势检测和响应
 * - 双指手势处理
 * - 右键/长按手势
 * - 手势防抖和节流
 * - 平台兼容性处理
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { createGesture, GestureDetail } from '@ionic/react';
import { PlatformService, HapticFeedbackType } from '../../services/platform';
import createLogger from '../../utils/logger';

const logger = createLogger('useGestureHandler');

/**
 * 手势类型枚举
 */
export enum GestureType {
  SwipeLeft = 'swipe-left',
  SwipeRight = 'swipe-right',
  SwipeUp = 'swipe-up',
  SwipeDown = 'swipe-down',
  TwoFingerTap = 'two-finger-tap',
  RightClick = 'right-click',
  LongPress = 'long-press'
}

/**
 * 手势事件接口
 */
export interface GestureEvent {
  type: GestureType;
  detail: GestureDetail;
  originalEvent?: Event;
}

/**
 * 手势配置接口
 */
export interface GestureConfig {
  threshold?: number;
  velocity?: number;
  debounceTime?: number;
  enableHapticFeedback?: boolean;
  preventDefaultOnTrigger?: boolean;
}

/**
 * 手势处理器配置
 */
export interface GestureHandlerConfig {
  // 滑动手势配置
  swipe?: GestureConfig & {
    horizontal?: boolean;
    vertical?: boolean;
  };
  
  // 双指手势配置
  twoFinger?: GestureConfig;
  
  // 右键/长按配置
  contextMenu?: GestureConfig;
  
  // 全局配置
  disabled?: boolean;
}

/**
 * 手势处理Hook接口
 */
export interface UseGestureHandlerReturn {
  // 状态
  isGestureProcessing: boolean;
  lastGesture: GestureEvent | null;
  
  // 方法
  enableGestures: () => void;
  disableGestures: () => void;
  resetGestureState: () => void;
}

/**
 * 默认手势配置
 */
const DEFAULT_CONFIG: Required<GestureHandlerConfig> = {
  swipe: {
    threshold: 15,
    velocity: 0.2,
    debounceTime: 500,
    enableHapticFeedback: true,
    preventDefaultOnTrigger: true,
    horizontal: true,
    vertical: false
  },
  twoFinger: {
    threshold: 10,
    velocity: 0.1,
    debounceTime: 300,
    enableHapticFeedback: true,
    preventDefaultOnTrigger: true
  },
  contextMenu: {
    threshold: 0,
    velocity: 0,
    debounceTime: 200,
    enableHapticFeedback: true,
    preventDefaultOnTrigger: true
  },
  disabled: false
};

/**
 * 手势处理Hook
 */
export const useGestureHandler = (
  elementRef: React.RefObject<HTMLElement>,
  onGesture: (event: GestureEvent) => void,
  config: GestureHandlerConfig = {}
): UseGestureHandlerReturn => {
  
  const [isGestureProcessing, setIsGestureProcessing] = useState(false);
  const [lastGesture, setLastGesture] = useState<GestureEvent | null>(null);
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  
  const gestureRefs = useRef<Array<{ destroy: () => void }>>([]);
  const debounceTimers = useRef<Map<GestureType, NodeJS.Timeout>>(new Map());
  
  // 合并配置
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    swipe: { ...DEFAULT_CONFIG.swipe, ...config.swipe },
    twoFinger: { ...DEFAULT_CONFIG.twoFinger, ...config.twoFinger },
    contextMenu: { ...DEFAULT_CONFIG.contextMenu, ...config.contextMenu }
  };

  /**
   * 触发手势事件
   */
  const triggerGestureEvent = useCallback(async (
    type: GestureType,
    detail: GestureDetail,
    originalEvent?: Event
  ) => {
    if (!gesturesEnabled || mergedConfig.disabled) return;

    // 检查防抖
    const debounceKey = type;
    const debounceTime = mergedConfig.swipe.debounceTime;
    
    if (debounceTimers.current.has(debounceKey)) {
      return; // 还在防抖期间
    }

    // 设置防抖定时器
    const timer = setTimeout(() => {
      debounceTimers.current.delete(debounceKey);
    }, debounceTime);
    debounceTimers.current.set(debounceKey, timer);

    setIsGestureProcessing(true);

    try {
      const gestureEvent: GestureEvent = {
        type,
        detail,
        originalEvent
      };

      setLastGesture(gestureEvent);

      // 触觉反馈
      if (mergedConfig.swipe.enableHapticFeedback) {
        await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);
      }

      // 阻止默认事件
      if (mergedConfig.swipe.preventDefaultOnTrigger && originalEvent) {
        originalEvent.preventDefault();
      }

      // 触发回调
      onGesture(gestureEvent);

      logger.info('Gesture triggered:', type);
    } catch (error) {
      logger.error('Error handling gesture:', error);
    } finally {
      // 延迟重置处理状态
      setTimeout(() => {
        setIsGestureProcessing(false);
      }, 100);
    }
  }, [gesturesEnabled, mergedConfig, onGesture]);

  /**
   * 创建滑动手势
   */
  const createSwipeGesture = useCallback(() => {
    if (!elementRef.current) return null;

    const gesture = createGesture({
      el: elementRef.current,
      threshold: mergedConfig.swipe.threshold,
      gestureName: 'swipe-gesture',
      onMove: (detail) => {
        if (isGestureProcessing) return;
        
        const velocity = mergedConfig.swipe.horizontal ? detail.velocityX : detail.velocityY;
        const delta = mergedConfig.swipe.horizontal ? detail.deltaX : detail.deltaY;
        
        if (Math.abs(velocity) > (mergedConfig.swipe?.velocity ?? 0.2) && Math.abs(delta) > 50) {
          let gestureType: GestureType;
          
          if (mergedConfig.swipe.horizontal) {
            gestureType = velocity < 0 ? GestureType.SwipeLeft : GestureType.SwipeRight;
          } else {
            gestureType = velocity < 0 ? GestureType.SwipeUp : GestureType.SwipeDown;
          }
          
          triggerGestureEvent(gestureType, detail);
        }
      }
    });

    return gesture;
  }, [elementRef, mergedConfig.swipe, isGestureProcessing, triggerGestureEvent]);

  /**
   * 创建双指手势
   */
  const createTwoFingerGesture = useCallback(() => {
    if (!elementRef.current) return null;

    const gesture = createGesture({
      el: elementRef.current,
      gestureName: 'two-finger-gesture',
      threshold: mergedConfig.twoFinger.threshold,
      canStart: (detail: any) => {
        return detail.event.touches && detail.event.touches.length === 2;
      },
      onStart: (detail) => {
        triggerGestureEvent(GestureType.TwoFingerTap, detail, detail.event);
      }
    });

    return gesture;
  }, [elementRef, mergedConfig.twoFinger, triggerGestureEvent]);

  /**
   * 创建右键手势
   */
  const createContextMenuGesture = useCallback(() => {
    if (!elementRef.current) return;

    const handleContextMenu = (e: MouseEvent) => {
      const mockDetail: GestureDetail = {
        type: GestureType.RightClick,
        event: e as any,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        deltaX: 0,
        deltaY: 0,
        velocityX: 0,
        velocityY: 0,
        startTime: Date.now(),
        currentTime: Date.now()
      };

      triggerGestureEvent(GestureType.RightClick, mockDetail, e);
    };

    elementRef.current.addEventListener('contextmenu', handleContextMenu);

    return {
      destroy: () => {
        if (elementRef.current) {
          elementRef.current.removeEventListener('contextmenu', handleContextMenu);
        }
      }
    };
  }, [elementRef, triggerGestureEvent]);

  /**
   * 启用手势
   */
  const enableGestures = useCallback(() => {
    setGesturesEnabled(true);
    logger.info('Gestures enabled');
  }, []);

  /**
   * 禁用手势
   */
  const disableGestures = useCallback(() => {
    setGesturesEnabled(false);
    logger.info('Gestures disabled');
  }, []);

  /**
   * 重置手势状态
   */
  const resetGestureState = useCallback(() => {
    setIsGestureProcessing(false);
    setLastGesture(null);
    
    // 清除所有防抖定时器
    debounceTimers.current.forEach((timer) => {
      clearTimeout(timer);
    });
    debounceTimers.current.clear();
    
    logger.info('Gesture state reset');
  }, []);

  /**
   * 初始化手势
   */
  useEffect(() => {
    if (!elementRef.current || mergedConfig.disabled || !gesturesEnabled) {
      return;
    }

    // 清除之前的手势
    gestureRefs.current.forEach(gesture => gesture.destroy());
    gestureRefs.current = [];

    // 创建滑动手势
    const swipeGesture = createSwipeGesture();
    if (swipeGesture) {
      swipeGesture.enable();
      gestureRefs.current.push(swipeGesture);
    }

    // 创建双指手势
    const twoFingerGesture = createTwoFingerGesture();
    if (twoFingerGesture) {
      twoFingerGesture.enable();
      gestureRefs.current.push(twoFingerGesture);
    }

    // 创建右键手势
    const contextMenuGesture = createContextMenuGesture();
    if (contextMenuGesture) {
      gestureRefs.current.push(contextMenuGesture);
    }

    logger.info('Gestures initialized');

    // 清理函数
    return () => {
      gestureRefs.current.forEach(gesture => gesture.destroy());
      gestureRefs.current = [];
      
      // 清除防抖定时器
      debounceTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      debounceTimers.current.clear();
    };
  }, [
    elementRef, 
    mergedConfig.disabled, 
    gesturesEnabled,
    createSwipeGesture,
    createTwoFingerGesture,
    createContextMenuGesture
  ]);

  return {
    // 状态
    isGestureProcessing,
    lastGesture,
    
    // 方法
    enableGestures,
    disableGestures,
    resetGestureState
  };
};

export default useGestureHandler;