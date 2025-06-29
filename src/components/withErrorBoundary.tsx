/**
 * 错误边界高阶组件
 * 为组件添加错误边界保护的HOC
 * 
 * @description 特性：
 * - 简化错误边界的使用
 * - 可配置的错误处理选项
 * - 支持自定义fallback UI
 * - TypeScript类型安全
 */

import React, { ComponentType, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * 错误边界配置选项
 */
export interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  isolate?: boolean; // 是否隔离错误，防止向上传播
}

/**
 * 错误边界HOC
 * @param WrappedComponent 要包装的组件
 * @param options 错误边界配置选项
 * @returns 包装后的组件
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): ComponentType<P> {
  const {
    fallback,
    onError,
    showDetails,
    isolate = true
  } = options;

  const WithErrorBoundaryComponent: ComponentType<P> = (props: P) => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      // 执行自定义错误处理
      if (onError) {
        onError(error, errorInfo);
      }

      // 如果不隔离错误，重新抛出
      if (!isolate) {
        throw error;
      }
    };

    return (
      <ErrorBoundary
        fallback={fallback}
        onError={handleError}
        showDetails={showDetails}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  // 设置显示名称以便调试
  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

/**
 * 创建带有默认选项的错误边界HOC
 */
export const withDefaultErrorBoundary = <P extends object>(
  WrappedComponent: ComponentType<P>
) => withErrorBoundary(WrappedComponent, {
  showDetails: process.env.NODE_ENV === 'development',
  isolate: true
});

/**
 * 创建不显示详情的错误边界HOC（用于生产环境）
 */
export const withProductionErrorBoundary = <P extends object>(
  WrappedComponent: ComponentType<P>
) => withErrorBoundary(WrappedComponent, {
  showDetails: false,
  isolate: true
});

export default withErrorBoundary;