/**
 * Capacitor 性能优化服务
 * 专门针对混合应用的性能优化
 */

import { capacitorService } from './capacitorService';
import createLogger from '../../utils/logger';

const logger = createLogger('PerformanceOptimizer');

interface PerformanceConfig {
  // WebView 优化
  enableWebViewOptimization: boolean;
  enableHardwareAcceleration: boolean;
  enableWebGL: boolean;
  
  // 内存管理
  enableMemoryOptimization: boolean;
  maxMemoryUsage: number; // MB
  memoryWarningThreshold: number; // MB
  
  // 渲染优化
  enableRenderOptimization: boolean;
  targetFPS: number;
  enableVsync: boolean;
  
  // 网络优化
  enableNetworkOptimization: boolean;
  enableCaching: boolean;
  cacheSize: number; // MB
  
  // 电池优化
  enableBatteryOptimization: boolean;
  enableBackgroundThrottling: boolean;
}

class PerformanceOptimizer {
  private config: PerformanceConfig = {
    enableWebViewOptimization: true,
    enableHardwareAcceleration: true,
    enableWebGL: true,
    
    enableMemoryOptimization: true,
    maxMemoryUsage: 256,
    memoryWarningThreshold: 200,
    
    enableRenderOptimization: true,
    targetFPS: 60,
    enableVsync: true,
    
    enableNetworkOptimization: true,
    enableCaching: true,
    cacheSize: 100,
    
    enableBatteryOptimization: true,
    enableBackgroundThrottling: true
  };

  private performanceObserver?: PerformanceObserver;
  private memoryMonitor?: NodeJS.Timeout;
  private frameMonitor?: number;
  private isBackgroundMode = false;

  /**
   * 初始化性能优化器
   */
  async initialize(): Promise<void> {
    try {
      logger.info('初始化性能优化器');
      
      // 根据平台调整配置
      await this.adjustConfigForPlatform();
      
      // 应用WebView优化
      if (this.config.enableWebViewOptimization) {
        await this.optimizeWebView();
      }
      
      // 启动内存监控
      if (this.config.enableMemoryOptimization) {
        this.startMemoryMonitoring();
      }
      
      // 启动渲染优化
      if (this.config.enableRenderOptimization) {
        this.optimizeRendering();
      }
      
      // 启动网络优化
      if (this.config.enableNetworkOptimization) {
        this.optimizeNetwork();
      }
      
      // 监听应用生命周期
      this.setupLifecycleOptimization();
      
      logger.info('性能优化器初始化完成', this.config);
      
    } catch (error) {
      logger.error('性能优化器初始化失败', error);
      throw error;
    }
  }

  /**
   * 根据平台调整配置
   */
  private async adjustConfigForPlatform(): Promise<void> {
    const platform = capacitorService.getPlatform();
    const deviceInfo = await capacitorService.getDeviceInfo();
    
    if (platform === 'ios') {
      // iOS 优化
      this.config.enableHardwareAcceleration = true;
      this.config.enableWebGL = true;
      this.config.targetFPS = 60;
      
      // 低端设备优化
      if (deviceInfo?.memUsed && deviceInfo.memUsed < 2000) {
        this.config.maxMemoryUsage = 128;
        this.config.targetFPS = 30;
      }
      
    } else if (platform === 'android') {
      // Android 优化
      this.config.enableHardwareAcceleration = true;
      
      // 根据 Android 版本调整
      if (deviceInfo?.osVersion) {
        const androidVersion = parseInt(deviceInfo.osVersion);
        if (androidVersion < 7) {
          this.config.enableWebGL = false;
          this.config.targetFPS = 30;
        }
      }
      
    } else {
      // Web 平台优化
      this.config.enableHardwareAcceleration = false;
      this.config.enableBatteryOptimization = false;
    }
    
    logger.info('平台特定配置调整完成', { platform, config: this.config });
  }

  /**
   * WebView 优化
   */
  private async optimizeWebView(): Promise<void> {
    if (!capacitorService.isNative()) return;
    
    try {
      // 启用硬件加速
      if (this.config.enableHardwareAcceleration) {
        document.documentElement.style.transform = 'translateZ(0)';
        document.documentElement.style.backfaceVisibility = 'hidden';
      }
      
      // 优化滚动性能
      (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
      document.documentElement.style.scrollBehavior = 'smooth';
      
      // 优化触摸延迟
      document.documentElement.style.touchAction = 'manipulation';
      
      // 禁用选择和高亮
      (document.documentElement.style as any).webkitUserSelect = 'none';
      (document.documentElement.style as any).webkitTouchCallout = 'none';
      (document.documentElement.style as any).webkitTapHighlightColor = 'transparent';
      
      logger.info('WebView 优化完成');
      
    } catch (error) {
      logger.error('WebView 优化失败', error);
    }
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    if (!('memory' in performance)) {
      logger.warn('浏览器不支持内存监控');
      return;
    }
    
    this.memoryMonitor = setInterval(() => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      
      // 检查内存使用
      if (usedMB > this.config.memoryWarningThreshold) {
        logger.warn('内存使用超过阈值', { 
          used: usedMB.toFixed(2) + 'MB',
          threshold: this.config.memoryWarningThreshold + 'MB'
        });
        
        this.triggerMemoryCleanup();
      }
      
      if (usedMB > this.config.maxMemoryUsage) {
        logger.error('内存使用超过限制', {
          used: usedMB.toFixed(2) + 'MB',
          limit: this.config.maxMemoryUsage + 'MB'
        });
        
        this.forceMemoryCleanup();
      }
      
      // 定期记录内存状态
      if (Math.random() < 0.1) { // 10% 概率记录
        logger.info('内存状态', {
          used: usedMB.toFixed(2) + 'MB',
          total: totalMB.toFixed(2) + 'MB',
          limit: limitMB.toFixed(2) + 'MB',
          usage: ((usedMB / limitMB) * 100).toFixed(1) + '%'
        });
      }
      
    }, 5000); // 每5秒检查一次
  }

  /**
   * 优化渲染性能
   */
  private optimizeRendering(): void {
    let lastFrameTime = 0;
    let frameCount = 0;
    let fpsArray: number[] = [];
    
    const measureFrame = (currentTime: number) => {
      if (lastFrameTime) {
        const delta = currentTime - lastFrameTime;
        const fps = 1000 / delta;
        
        fpsArray.push(fps);
        if (fpsArray.length > 60) { // 保持最近60帧的记录
          fpsArray.shift();
        }
        
        frameCount++;
        
        // 每60帧检查一次性能
        if (frameCount % 60 === 0) {
          const avgFPS = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length;
          
          if (avgFPS < this.config.targetFPS * 0.8) {
            logger.warn('渲染性能下降', {
              currentFPS: avgFPS.toFixed(1),
              targetFPS: this.config.targetFPS
            });
            
            this.adaptRenderingQuality(avgFPS);
          }
        }
      }
      
      lastFrameTime = currentTime;
      
      if (!this.isBackgroundMode) {
        this.frameMonitor = requestAnimationFrame(measureFrame);
      }
    };
    
    this.frameMonitor = requestAnimationFrame(measureFrame);
  }

  /**
   * 自适应渲染质量
   */
  private adaptRenderingQuality(currentFPS: number): void {
    const performanceRatio = currentFPS / this.config.targetFPS;
    
    if (performanceRatio < 0.8) {
      // 降低渲染质量
      logger.info('降低渲染质量以提升性能');
      
      // 减少动画复杂度
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      
      // 禁用某些视觉效果
      document.documentElement.style.setProperty('--backdrop-filter', 'none');
      document.documentElement.style.setProperty('--box-shadow', 'none');
      
    } else if (performanceRatio > 0.95) {
      // 恢复渲染质量
      logger.info('恢复正常渲染质量');
      
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--backdrop-filter');
      document.documentElement.style.removeProperty('--box-shadow');
    }
  }

  /**
   * 网络优化
   */
  private optimizeNetwork(): void {
    if (!this.config.enableCaching) return;
    
    // 启用Service Worker缓存
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        logger.info('Service Worker 注册成功');
      }).catch(error => {
        logger.warn('Service Worker 注册失败', error);
      });
    }
    
    // 预连接到重要域名
    const preconnectDomains = [
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ];
    
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  /**
   * 应用生命周期优化
   */
  private setupLifecycleOptimization(): void {
    if (!capacitorService.isNative()) return;
    
    capacitorService.addAppStateListener((state) => {
      if (state.isActive) {
        logger.info('应用进入前台，恢复性能优化');
        this.isBackgroundMode = false;
        this.resumeOptimizations();
      } else {
        logger.info('应用进入后台，启动节能模式');
        this.isBackgroundMode = true;
        this.enablePowerSavingMode();
      }
    });
  }

  /**
   * 启用节能模式
   */
  private enablePowerSavingMode(): void {
    if (!this.config.enableBatteryOptimization) return;
    
    // 暂停不必要的动画
    document.documentElement.style.setProperty('--animation-play-state', 'paused');
    
    // 停止帧监控
    if (this.frameMonitor) {
      cancelAnimationFrame(this.frameMonitor);
      this.frameMonitor = undefined;
    }
    
    // 减少内存监控频率
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = setInterval(() => {
        // 降低频率的内存检查
      }, 30000); // 30秒检查一次
    }
    
    logger.info('节能模式已启用');
  }

  /**
   * 恢复优化
   */
  private resumeOptimizations(): void {
    // 恢复动画
    document.documentElement.style.removeProperty('--animation-play-state');
    
    // 重启帧监控
    if (this.config.enableRenderOptimization) {
      this.optimizeRendering();
    }
    
    // 恢复正常内存监控
    if (this.config.enableMemoryOptimization) {
      if (this.memoryMonitor) {
        clearInterval(this.memoryMonitor);
      }
      this.startMemoryMonitoring();
    }
    
    logger.info('性能优化已恢复');
  }

  /**
   * 触发内存清理
   */
  private triggerMemoryCleanup(): void {
    // 清理可能的内存泄漏
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
    
    // 清理缓存
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    logger.info('内存清理已触发');
  }

  /**
   * 强制内存清理
   */
  private forceMemoryCleanup(): void {
    this.triggerMemoryCleanup();
    
    // 降低性能要求
    this.config.targetFPS = Math.max(15, this.config.targetFPS * 0.5);
    this.config.maxMemoryUsage *= 0.8;
    
    // 禁用某些功能
    document.documentElement.style.setProperty('--enable-blur', 'false');
    document.documentElement.style.setProperty('--enable-shadows', 'false');
    
    logger.warn('强制内存清理已执行，性能要求已降低');
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): any {
    const memory = (performance as any).memory;
    
    return {
      config: this.config,
      platform: capacitorService.getPlatform(),
      isNative: capacitorService.isNative(),
      memory: memory ? {
        used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB'
      } : null,
      isBackgroundMode: this.isBackgroundMode
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('性能配置已更新', this.config);
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }
    
    if (this.frameMonitor) {
      cancelAnimationFrame(this.frameMonitor);
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    logger.info('性能优化器清理完成');
  }
}

// 单例实例
export const performanceOptimizer = new PerformanceOptimizer();

export default performanceOptimizer;