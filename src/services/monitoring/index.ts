/**
 * 性能监控服务导出
 * 统一导出性能监控相关功能
 */

export { 
  PerformanceService,
  measurePerformance,
  type PerformanceMetrics,
  type PerformanceConfig
} from './performanceService';

export { PerformanceService as default } from './performanceService';