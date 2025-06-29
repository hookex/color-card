/**
 * useDebounce Hook测试
 * 测试防抖Hook的功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../utils/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 500));

    act(() => {
      result.current.debouncedFunction('test1');
      result.current.debouncedFunction('test2');
      result.current.debouncedFunction('test3');
    });

    // 函数还没有被调用
    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 只调用一次，使用最后的参数
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test3');
  });

  it('should handle leading option', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => 
      useDebounce(mockFn, 500, { leading: true, trailing: false })
    );

    act(() => {
      result.current.debouncedFunction('test');
    });

    // 立即调用（leading）
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // trailing为false，不再调用
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle maxWait option', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => 
      useDebounce(mockFn, 500, { maxWait: 300 })
    );

    act(() => {
      result.current.debouncedFunction('test1');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.debouncedFunction('test2');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // maxWait达到，应该调用函数
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should cancel debounced calls', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 500));

    act(() => {
      result.current.debouncedFunction('test');
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should flush pending calls', () => {
    const mockFn = vi.fn().mockReturnValue('result');
    const { result } = renderHook(() => useDebounce(mockFn, 500));

    act(() => {
      result.current.debouncedFunction('test');
    });

    let flushResult;
    act(() => {
      flushResult = result.current.flush();
    });

    expect(mockFn).toHaveBeenCalledWith('test');
    expect(flushResult).toBe('result');
  });

  it('should track pending state', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 500));

    expect(result.current.pending).toBe(false);

    act(() => {
      result.current.debouncedFunction('test');
    });

    expect(result.current.pending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.pending).toBe(false);
  });

  it('should update function reference', () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();
    
    const { result, rerender } = renderHook(
      ({ fn }) => useDebounce(fn, 500),
      { initialProps: { fn: mockFn1 } }
    );

    act(() => {
      result.current.debouncedFunction('test1');
    });

    // 更新函数引用
    rerender({ fn: mockFn2 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 应该调用新的函数
    expect(mockFn1).not.toHaveBeenCalled();
    expect(mockFn2).toHaveBeenCalledWith('test1');
  });
});