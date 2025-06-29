/**
 * 获取前一个值的Hook
 * 用于比较当前值和前一个值的变化
 * 
 * @description 特性：
 * - 类型安全
 * - 支持任何类型的值
 * - 自动更新前一个值
 * - 内存效率高
 */

import { useRef, useEffect } from 'react';

/**
 * 获取前一个值的Hook
 * @param value 当前值
 * @returns 前一个值
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * 获取前一个值的Hook（带初始值）
 * @param value 当前值
 * @param initialValue 初始值
 * @returns 前一个值
 */
export const usePreviousWithInitial = <T>(value: T, initialValue: T): T => {
  const ref = useRef<T>(initialValue);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * 比较当前值和前一个值是否发生变化的Hook
 * @param value 当前值
 * @param compareFn 比较函数（可选）
 * @returns 是否发生变化
 */
export const useHasChanged = <T>(
  value: T,
  compareFn?: (prev: T | undefined, current: T) => boolean
): boolean => {
  const previous = usePrevious(value);
  
  if (compareFn) {
    return compareFn(previous, value);
  }
  
  return previous !== value;
};

/**
 * 获取值变化的详细信息的Hook
 * @param value 当前值
 * @returns 变化信息
 */
export const useValueChange = <T>(value: T) => {
  const previous = usePrevious(value);
  const hasChanged = previous !== value;
  
  return {
    current: value,
    previous,
    hasChanged,
    isFirstRender: previous === undefined
  };
};

export default usePrevious;