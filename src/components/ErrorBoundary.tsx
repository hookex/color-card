/**
 * 错误边界组件
 * 捕获React组件树中的JavaScript错误，并显示回退UI
 * 
 * @description 特性：
 * - 生产环境和开发环境不同的错误展示
 * - 错误日志记录
 * - 优雅的回退UI
 * - 重试功能
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { refresh, bugOutline } from 'ionicons/icons';
import createLogger from '../utils/logger';
import './ErrorBoundary.scss';

const logger = createLogger('ErrorBoundary');

/**
 * 错误边界状态接口
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

/**
 * 错误边界Props接口
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

/**
 * 错误边界组件
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      errorId: this.generateErrorId()
    };
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 捕获错误的生命周期方法
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * 错误发生后的处理
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // 记录错误日志
    logger.error('Error caught by ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });

    // 更新状态
    this.setState({
      error,
      errorInfo
    });

    // 调用外部错误处理器
    if (onError) {
      onError(error, errorInfo);
    }

    // 发送错误报告（生产环境）
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  /**
   * 发送错误报告
   */
  private reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // 这里可以集成错误监控服务，如 Sentry
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        url: window.location.href
      };

      logger.info('Error report generated:', errorReport);
      
      // 实际发送逻辑可以在这里实现
      // fetch('/api/error-report', { method: 'POST', body: JSON.stringify(errorReport) });
    } catch (reportError) {
      logger.error('Failed to report error:', reportError);
    }
  }

  /**
   * 重试功能
   */
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: this.generateErrorId()
    });
    
    logger.info('ErrorBoundary retry triggered');
  };

  /**
   * 渲染错误UI
   */
  private renderErrorUI() {
    const { error, errorInfo, errorId } = this.state;
    const { showDetails = process.env.NODE_ENV === 'development' } = this.props;

    return (
      <div className="error-boundary">
        <div className="error-boundary__container">
          <div className="error-boundary__icon">
            <IonIcon icon={bugOutline} />
          </div>
          
          <div className="error-boundary__content">
            <h2 className="error-boundary__title">
              出现了一个错误
            </h2>
            
            <p className="error-boundary__message">
              抱歉，应用遇到了意外错误。请尝试刷新页面或联系技术支持。
            </p>
            
            {showDetails && error && (
              <div className="error-boundary__details">
                <h3>错误详情</h3>
                <div className="error-boundary__error-info">
                  <p><strong>错误ID:</strong> {errorId}</p>
                  <p><strong>错误信息:</strong> {error.message}</p>
                  {error.stack && (
                    <details className="error-boundary__stack">
                      <summary>错误堆栈</summary>
                      <pre>{error.stack}</pre>
                    </details>
                  )}
                  {errorInfo?.componentStack && (
                    <details className="error-boundary__component-stack">
                      <summary>组件堆栈</summary>
                      <pre>{errorInfo.componentStack}</pre>
                    </details>
                  )}
                </div>
              </div>
            )}
            
            <div className="error-boundary__actions">
              <IonButton 
                fill="solid" 
                color="primary"
                onClick={this.handleRetry}
              >
                <IonIcon icon={refresh} slot="start" />
                重试
              </IonButton>
              
              <IonButton 
                fill="outline" 
                color="medium"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </IonButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 如果提供了自定义fallback，使用它
      if (fallback) {
        return fallback;
      }
      
      // 否则使用默认错误UI
      return this.renderErrorUI();
    }

    return children;
  }
}

export default ErrorBoundary;