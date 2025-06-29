/**
 * 防抖Hook
 * 用于延迟执行函数调用，避免频繁操作
 * 
 * @description 特性：
 * - 自动取消和重新设置定时器
 * - 支持立即执行选项
 * - 内存泄漏防护
 * - TypeScript类型安全
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * 防抖Hook接口
 */
export interface UseDebounceReturn<T extends (...args: any[]) => any> {
  debouncedFunction: T;
  cancel: () => void;
  flush: () => void;
  pending: boolean;
}

/**
 * 防抖Hook配置
 */
export interface DebounceOptions {
  leading?: boolean;  // 是否在延迟开始前调用
  trailing?: boolean; // 是否在延迟结束后调用
  maxWait?: number;   // 最大等待时间
}

/**
 * 防抖Hook
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param options 配置选项
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: DebounceOptions = {}
): UseDebounceReturn<T> => {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const funcRef = useRef<T>(func);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
   * 前导调用
   */
  const leadingEdge = useCallback((args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now();
    
    // 设置定时器用于trailing调用
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (trailing && argsRef.current) {
        invokeFunc(argsRef.current);
      }
      pendingRef.current = false;
    }, delay);
    
    pendingRef.current = true;
    
    // 如果是leading调用，立即执行
    if (leading) {
      return invokeFunc(args);
    }
  }, [delay, leading, trailing, invokeFunc]);

  /**
   * 判断是否应该调用函数
   */
  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    // 第一次调用或者超过延迟时间或者超过最大等待时间
    return (
      lastCallTimeRef.current === 0 ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  /**
   * 取消所有定时器
   */
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
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
   * 防抖函数
   */
  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    argsRef.current = args;
    lastCallTimeRef.current = time;

    if (isInvoking) {
      if (timeoutRef.current === null) {
        return leadingEdge(args);
      }
      
      if (maxWait !== undefined) {
        // 处理maxWait的情况
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          if (trailing && argsRef.current) {
            invokeFunc(argsRef.current);
          }
          pendingRef.current = false;
        }, delay);
        
        pendingRef.current = true;
        return invokeFunc(args);
      }
    }

    if (timeoutRef.current === null) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (trailing && argsRef.current) {
          invokeFunc(argsRef.current);
        }
        pendingRef.current = false;
      }, delay);
      pendingRef.current = true;
    }
  }, [delay, shouldInvoke, leadingEdge, trailing, maxWait, invokeFunc]) as T;

  // 清理effect
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    debouncedFunction,
    cancel,
    flush,
    get pending() {
      return pendingRef.current;
    }
  };
};

export default useDebounce;