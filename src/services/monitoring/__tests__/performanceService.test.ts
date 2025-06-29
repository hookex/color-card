/**
 * 性能监控服务测试
 * 测试性能监控服务的核心功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceService, measurePerformance } from '../performanceService';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  }
};

// Mock PerformanceObserver
class MockPerformanceObserver {
  constructor(private callback: Function) {}
  observe() {}
  disconnect() {}
}

global.PerformanceObserver = MockPerformanceObserver as any;
global.performance = mockPerformance as any;

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}));

describe('PerformanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset singleton instance
    (PerformanceService as any).instance = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getInstance', () => {
    it('should create singleton instance', () => {
      const instance1 = PerformanceService.getInstance();
      const instance2 = PerformanceService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should accept configuration', () => {
      const config = {
        enableWebVitals: false,
        sampleRate: 0.5
      };
      
      const instance = PerformanceService.getInstance(config);
      expect(instance).toBeDefined();
    });
  });

  describe('measureComponentRender', () => {
    it('should measure render time correctly', () => {
      const service = PerformanceService.getInstance();
      
      mockPerformance.now
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(116);
      
      const result = service.measureComponentRender('TestComponent', () => {
        return 'test result';
      });
      
      expect(result).toBe('test result');
    });

    it('should warn on slow renders', () => {
      const service = PerformanceService.getInstance();
      
      mockPerformance.now
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(120); // 20ms render time
      
      service.measureComponentRender('SlowComponent', () => {
        return 'result';
      });
      
      // Should trigger slow render warning
    });
  });

  describe('measureAsyncOperation', () => {
    it('should measure async operations', async () => {
      const service = PerformanceService.getInstance();
      
      mockPerformance.now
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(200);
      
      const result = await service.measureAsyncOperation('testOp', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'async result';
      });
      
      expect(result).toBe('async result');
    });

    it('should handle async operation errors', async () => {
      const service = PerformanceService.getInstance();
      
      mockPerformance.now
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(150);
      
      await expect(
        service.measureAsyncOperation('errorOp', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('getPerformanceReport', () => {
    it('should generate performance report', () => {
      const service = PerformanceService.getInstance();
      
      // Add some mock metrics
      (service as any).metrics = [
        {
          FCP: 1500,
          LCP: 2000,
          memoryUsage: 30,
          timestamp: Date.now(),
          sessionId: 'test-session'
        },
        {
          FCP: 1800,
          LCP: 2300,
          memoryUsage: 35,
          timestamp: Date.now(),
          sessionId: 'test-session'
        }
      ];
      
      const report = service.getPerformanceReport();
      
      expect(report.summary).toBeDefined();
      expect(report.details).toHaveLength(2);
      expect(report.recommendations).toBeInstanceOf(Array);
      
      expect(report.summary.FCP_avg).toBe(1650);
      expect(report.summary.LCP_avg).toBe(2150);
    });

    it('should provide performance recommendations', () => {
      const service = PerformanceService.getInstance();
      
      // Add metrics that should trigger recommendations
      (service as any).metrics = [
        {
          FCP: 3000, // Slow FCP
          LCP: 3000, // Slow LCP
          FID: 200,  // High FID
          CLS: 0.2,  // High CLS
          animationFrameRate: 20, // Low FPS
          memoryUsage: 80, // High memory
          timestamp: Date.now(),
          sessionId: 'test-session'
        }
      ];
      
      const report = service.getPerformanceReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations).toContain('首次内容绘制时间较长，考虑优化资源加载');
      expect(report.recommendations).toContain('最大内容绘制时间较长，考虑优化关键资源');
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      const service = PerformanceService.getInstance();
      
      service.destroy();
      
      // Should disconnect observers and clear intervals
    });
  });
});

describe('measurePerformance decorator', () => {
  it('should measure method performance', () => {
    class TestClass {
      @measurePerformance('testMethod')
      testMethod(value: string) {
        return `processed: ${value}`;
      }
    }
    
    const instance = new TestClass();
    const result = instance.testMethod('test');
    
    expect(result).toBe('processed: test');
  });

  it('should use default method name when not provided', () => {
    class TestClass {
      @measurePerformance()
      anotherMethod() {
        return 'result';
      }
    }
    
    const instance = new TestClass();
    const result = instance.anotherMethod();
    
    expect(result).toBe('result');
  });
});