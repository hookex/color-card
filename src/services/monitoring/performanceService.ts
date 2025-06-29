/**
 * 性能监控服务
 * 监控应用性能指标并提供优化建议
 * 
 * @description 特性：
 * - Web Vitals监控
 * - 自定义性能指标收集
 * - 内存使用监控
 * - 渲染性能分析
 * - 用户交互延迟测量
 */

import createLogger from '../../utils/logger';

const logger = createLogger('PerformanceService');

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  // Web Vitals
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  
  // 自定义指标
  componentRenderTime?: number;
  animationFrameRate?: number;
  memoryUsage?: number;
  bundleSize?: number;
  
  // 用户交互
  interactionDelay?: number;
  scrollPerformance?: number;
  
  // 时间戳
  timestamp: number;
  sessionId: string;
}

/**
 * 性能监控配置
 */
export interface PerformanceConfig {
  enableWebVitals: boolean;
  enableMemoryMonitoring: boolean;
  enableAnimationMonitoring: boolean;
  enableInteractionTracking: boolean;
  sampleRate: number; // 0-1之间，采样率
  reportInterval: number; // 报告间隔（毫秒）
}

/**
 * 性能监控服务类
 */
export class PerformanceService {
  private static instance: PerformanceService;
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private sessionId: string;
  private observers: PerformanceObserver[] = [];
  private animationFrameId?: number;
  private memoryCheckInterval?: number;

  private constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableWebVitals: true,
      enableMemoryMonitoring: true,
      enableAnimationMonitoring: true,
      enableInteractionTracking: true,
      sampleRate: 1.0,
      reportInterval: 30000, // 30秒
      ...config
    };
    
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  /**
   * 获取性能监控服务实例
   */
  static getInstance(config?: Partial<PerformanceConfig>): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService(config);
    }
    return PerformanceService.instance;
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化监控
   */
  private initialize(): void {
    if (Math.random() > this.config.sampleRate) {
      logger.info('Performance monitoring skipped due to sampling rate');
      return;
    }

    logger.info('Initializing performance monitoring', {
      sessionId: this.sessionId,
      config: this.config
    });

    if (this.config.enableWebVitals) {
      this.initWebVitalsMonitoring();
    }

    if (this.config.enableMemoryMonitoring) {
      this.initMemoryMonitoring();
    }

    if (this.config.enableAnimationMonitoring) {
      this.initAnimationMonitoring();
    }

    if (this.config.enableInteractionTracking) {
      this.initInteractionTracking();
    }

    // 定期报告性能数据
    setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);

    // 页面卸载时报告
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
  }

  /**
   * 初始化Web Vitals监控
   */
  private initWebVitalsMonitoring(): void {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported');
      return;
    }

    try {
      // FCP和LCP
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric({ FCP: entry.startTime });
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          this.recordMetric({ LCP: lastEntry.startTime });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            this.recordMetric({ FID: fid });
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric({ CLS: clsValue });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // TTFB
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
        this.recordMetric({ TTFB: ttfb });
      }

    } catch (error) {
      logger.error('Failed to initialize Web Vitals monitoring:', error);
    }
  }

  /**
   * 初始化内存监控
   */
  private initMemoryMonitoring(): void {
    if (!('memory' in performance)) {
      logger.warn('Memory API not supported');
      return;
    }

    const checkMemory = () => {
      try {
        const memory = (performance as any).memory;
        if (memory) {
          const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
          this.recordMetric({ memoryUsage });
          
          // 内存使用警告
          if (memoryUsage > 100) {
            logger.warn('High memory usage detected:', memoryUsage, 'MB');
          }
        }
      } catch (error) {
        logger.error('Memory monitoring error:', error);
      }
    };

    // 每30秒检查一次内存使用
    this.memoryCheckInterval = window.setInterval(checkMemory, 30000);
    checkMemory(); // 立即检查一次
  }

  /**
   * 初始化动画监控
   */
  private initAnimationMonitoring(): void {
    let lastTime = performance.now();
    let frameCount = 0;
    let totalTime = 0;

    const measureFrame = (currentTime: number) => {
      frameCount++;
      totalTime += currentTime - lastTime;
      lastTime = currentTime;

      // 每60帧计算一次平均帧率
      if (frameCount >= 60) {
        const averageFrameTime = totalTime / frameCount;
        const fps = 1000 / averageFrameTime;
        
        this.recordMetric({ animationFrameRate: fps });
        
        // 低帧率警告
        if (fps < 30) {
          logger.warn('Low frame rate detected:', fps.toFixed(2), 'fps');
        }

        frameCount = 0;
        totalTime = 0;
      }

      this.animationFrameId = requestAnimationFrame(measureFrame);
    };

    this.animationFrameId = requestAnimationFrame(measureFrame);
  }

  /**
   * 初始化交互追踪
   */
  private initInteractionTracking(): void {
    let interactionStart = 0;

    // 点击事件延迟
    document.addEventListener('click', () => {
      interactionStart = performance.now();
    });

    document.addEventListener('animationend', () => {
      if (interactionStart > 0) {
        const delay = performance.now() - interactionStart;
        this.recordMetric({ interactionDelay: delay });
        interactionStart = 0;
      }
    });

    // 滚动性能
    let scrollStart = 0;
    document.addEventListener('scroll', () => {
      if (scrollStart === 0) {
        scrollStart = performance.now();
      }
    }, { passive: true });

    document.addEventListener('scrollend', () => {
      if (scrollStart > 0) {
        const scrollTime = performance.now() - scrollStart;
        this.recordMetric({ scrollPerformance: scrollTime });
        scrollStart = 0;
      }
    });
  }

  /**
   * 记录性能指标
   */
  private recordMetric(metric: Partial<PerformanceMetrics>): void {
    const fullMetric: PerformanceMetrics = {
      ...metric,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.metrics.push(fullMetric);
    
    // 保持最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    logger.debug('Performance metric recorded:', fullMetric);
  }

  /**
   * 测量组件渲染时间
   */
  measureComponentRender<T>(
    componentName: string,
    renderFunction: () => T
  ): T {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    this.recordMetric({ 
      componentRenderTime: renderTime 
    });

    if (renderTime > 16) { // 超过一帧的时间
      logger.warn(`Slow component render detected: ${componentName}`, renderTime, 'ms');
    }

    return result;
  }

  /**
   * 测量异步操作性能
   */
  async measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      
      this.recordMetric({
        [`${operationName}Duration`]: endTime - startTime
      } as any);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric({
        [`${operationName}Error`]: endTime - startTime
      } as any);
      
      throw error;
    }
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    summary: Record<string, number>;
    details: PerformanceMetrics[];
    recommendations: string[];
  } {
    const summary: Record<string, number> = {};
    const recommendations: string[] = [];

    // 计算平均值
    const metricKeys = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'componentRenderTime', 'animationFrameRate', 'memoryUsage'];
    
    metricKeys.forEach(key => {
      const values = this.metrics
        .map(m => (m as any)[key])
        .filter(v => v !== undefined);
      
      if (values.length > 0) {
        summary[`${key}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
        summary[`${key}_max`] = Math.max(...values);
        summary[`${key}_min`] = Math.min(...values);
      }
    });

    // 生成建议
    if (summary.FCP_avg > 2000) {
      recommendations.push('首次内容绘制时间较长，考虑优化资源加载');
    }
    
    if (summary.LCP_avg > 2500) {
      recommendations.push('最大内容绘制时间较长，考虑优化关键资源');
    }
    
    if (summary.FID_avg > 100) {
      recommendations.push('首次输入延迟较高，考虑减少主线程阻塞');
    }
    
    if (summary.CLS_avg > 0.1) {
      recommendations.push('累积布局偏移较高，检查动态内容加载');
    }
    
    if (summary.animationFrameRate_avg < 50) {
      recommendations.push('动画帧率较低，考虑优化渲染性能');
    }
    
    if (summary.memoryUsage_avg > 50) {
      recommendations.push('内存使用较高，检查内存泄漏');
    }

    return {
      summary,
      details: this.metrics,
      recommendations
    };
  }

  /**
   * 报告性能指标
   */
  private reportMetrics(): void {
    if (this.metrics.length === 0) return;

    const report = this.getPerformanceReport();
    
    logger.info('Performance report:', {
      sessionId: this.sessionId,
      summary: report.summary,
      recommendations: report.recommendations,
      metricsCount: this.metrics.length
    });

    // 这里可以发送到分析服务
    // 例如：sendToAnalytics(report);
  }

  /**
   * 清理监控资源
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }

    this.reportMetrics(); // 最后报告一次
    
    logger.info('Performance monitoring destroyed');
  }
}

/**
 * 性能装饰器
 * 用于自动测量函数执行时间
 */
export function measurePerformance(name?: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function(...args: any[]) {
      const performance = PerformanceService.getInstance();
      return performance.measureComponentRender(methodName, () => {
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

export default PerformanceService;