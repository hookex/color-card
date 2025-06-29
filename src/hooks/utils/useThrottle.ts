/**
 * 节流Hook
 * 用于限制函数执行频率，确保在指定时间间隔内最多执行一次
 * 
 * @description 特性：
 * - 精确的时间间隔控制
 * - 支持前导和尾随执行
 * - 内存泄漏防护
 * - TypeScript类型安全
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * 节流Hook接口
 */
export interface UseThrottleReturn<T extends (...args: any[]) => any> {
  throttledFunction: T;
  cancel: () => void;
  flush: () => void;
  pending: boolean;
}

/**
 * 节流Hook配置
 */
export interface ThrottleOptions {
  leading?: boolean;  // 是否在间隔开始时调用
  trailing?: boolean; // 是否在间隔结束时调用
}

/**
 * 节流Hook
 * @param func 要节流的函数
 * @param delay 时间间隔（毫秒）
 * @param options 配置选项
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: ThrottleOptions = {}
): UseThrottleReturn<T> => {
  const {
    leading = true,
    trailing = true
  } = options;

  const funcRef = useRef<T>(func);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const argsRef = useRef<Parameters<T>>();
  const pendingRef = useRef<boolean>(false);

  // 更新函数引用
  funcRef.current = func;

  /**
   * 调用函数
   */
  const invokeFunc = useCallback((args: Parameters<T>) => {
    const currentFunc = funcRef.current;
    lastInvokeTimeRef.current = Date.now();
    pendingRef.current = false;
    return currentFunc(...args);
  }, []);

  /**
   * 判断是否应该调用函数
   */
  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
    
    // 第一次调用或者超过时间间隔
    return (
      lastInvokeTimeRef.current === 0 ||
      timeSinceLastInvoke >= delay
    );
  }, [delay]);

  /**
   * 获取剩余等待时间
   */
  const remainingWait = useCallback((time: number) => {
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
    return delay - timeSinceLastInvoke;
  }, [delay]);

  /**
   * 尾随调用
   */
  const trailingEdge = useCallback(() => {
    timeoutRef.current = null;
    
    // 只有在有pending的调用且trailing为true时才执行
    if (trailing && argsRef.current) {
      return invokeFunc(argsRef.current);
    }
    
    pendingRef.current = false;
  }, [trailing, invokeFunc]);

  /**
   * 设置定时器
   */
  const timerExpired = useCallback(() => {
    const time = Date.now();
    
    if (shouldInvoke(time)) {
      return trailingEdge();
    }
    
    // 重新设置定时器
    const remaining = remainingWait(time);
    timeoutRef.current = setTimeout(timerExpired, remaining);
  }, [shouldInvoke, trailingEdge, remainingWait]);

  /**
   * 前导调用
   */
  const leadingEdge = useCallback((time: number, args: Parameters<T>) => {
    lastInvokeTimeRef.current = time;
    
    // 设置定时器用于尾随调用
    timeoutRef.current = setTimeout(timerExpired, delay);
    pendingRef.current = true;
    
    // 如果是leading调用，立即执行
    if (leading) {
      return invokeFunc(args);
    }
  }, [delay, leading, invokeFunc, timerExpired]);

  /**
   * 取消定时器
   */
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastInvokeTimeRef.current = 0;
    lastCallTimeRef.current = 0;
    argsRef.current = undefined;
    pendingRef.current = false;
  }, []);

  /**
   * 立即执行pending的调用
   */
  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      return invokeFunc(argsRef.current);
    }
  }, [invokeFunc]);

  /**
   * 节流函数
   */
  const throttledFunction = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    argsRef.current = args;
    lastCallTimeRef.current = time;

    if (isInvoking) {
      if (timeoutRef.current === null) {
        return leadingEdge(time, args);
      }
      
      // 如果正在等待中，更新参数但不重新设置定时器
      return;
    }

    if (timeoutRef.current === null) {
      timeoutRef.current = setTimeout(timerExpired, delay);
      pendingRef.current = true;
    }
  }, [shouldInvoke, leadingEdge, delay, timerExpired]) as T;

  // 清理effect
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    throttledFunction,
    cancel,
    flush,
    get pending() {
      return pendingRef.current;
    }
  };
};

export default useThrottle;