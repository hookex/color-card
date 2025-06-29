/**
 * 平台服务层 - 统一管理跨平台功能和设备特性检测
 * 基于 Capacitor APIs 提供一致的平台适配接口
 * 
 * @description 负责处理应用中所有的平台差异化逻辑，包括：
 * - 平台检测和特性判断
 * - 设备信息获取
 * - 触觉反馈管理
 * - 原生功能调用
 * - 权限管理
 */

import { Capacitor } from '@capacitor/core';
import { Device, DeviceInfo } from '@capacitor/device';
import { Haptics, ImpactStyle, NotificationStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App, AppState } from '@capacitor/app';
import { Network } from '@capacitor/network';
import createLogger from '../../utils/logger';

const logger = createLogger('PlatformService');

/**
 * 平台类型枚举
 */
export enum PlatformType {
  Web = 'web',
  iOS = 'ios',
  Android = 'android'
}

/**
 * 设备类型枚举
 */
export enum DeviceType {
  Desktop = 'desktop',
  Mobile = 'mobile',
  Tablet = 'tablet'
}

/**
 * 触觉反馈类型
 */
export enum HapticFeedbackType {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Success = 'success',
  Warning = 'warning',
  Error = 'error'
}

/**
 * 设备信息接口
 */
export interface DeviceCapabilities {
  platform: PlatformType;
  deviceType: DeviceType;
  isNative: boolean;
  supportsHaptics: boolean;
  supportsStatusBar: boolean;
  supportsFullscreen: boolean;
  hasNotch: boolean;
  screenSize: {
    width: number;
    height: number;
    ratio: number;
  };
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * 网络状态接口
 */
export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

/**
 * 平台服务类
 * 提供统一的平台适配接口
 */
export class PlatformService {
  private static deviceInfo: DeviceInfo | null = null;
  private static capabilities: DeviceCapabilities | null = null;

  /**
   * 初始化平台服务
   * 获取设备信息和能力检测
   */
  static async initialize(): Promise<void> {
    try {
      // 获取设备信息
      if (Capacitor.isNativePlatform()) {
        this.deviceInfo = await Device.getInfo();
      }

      // 检测设备能力
      this.capabilities = await this.detectCapabilities();

      // 设置状态栏样式
      await this.setupStatusBar();

      logger.info('Platform service initialized successfully', {
        platform: this.capabilities.platform,
        deviceType: this.capabilities.deviceType,
        isNative: this.capabilities.isNative
      });
    } catch (error) {
      logger.error('Failed to initialize platform service:', error);
    }
  }

  /**
   * 获取当前平台类型
   * @returns 平台类型
   */
  static getPlatform(): PlatformType {
    if (Capacitor.isNativePlatform()) {
      return Capacitor.getPlatform() === 'ios' ? PlatformType.iOS : PlatformType.Android;
    }
    return PlatformType.Web;
  }

  /**
   * 检查是否为原生平台
   * @returns 是否为原生平台
   */
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * 检查是否为iOS平台
   * @returns 是否为iOS
   */
  static isIOS(): boolean {
    return this.getPlatform() === PlatformType.iOS;
  }

  /**
   * 检查是否为Android平台
   * @returns 是否为Android
   */
  static isAndroid(): boolean {
    return this.getPlatform() === PlatformType.Android;
  }

  /**
   * 检查是否为Web平台
   * @returns 是否为Web
   */
  static isWeb(): boolean {
    return this.getPlatform() === PlatformType.Web;
  }

  /**
   * 获取设备信息
   * @returns 设备信息
   */
  static async getDeviceInfo(): Promise<DeviceInfo | null> {
    if (!this.deviceInfo && Capacitor.isNativePlatform()) {
      try {
        this.deviceInfo = await Device.getInfo();
      } catch (error) {
        logger.error('Failed to get device info:', error);
        return null;
      }
    }
    return this.deviceInfo;
  }

  /**
   * 获取设备能力信息
   * @returns 设备能力信息
   */
  static async getCapabilities(): Promise<DeviceCapabilities> {
    if (!this.capabilities) {
      this.capabilities = await this.detectCapabilities();
    }
    return this.capabilities;
  }

  /**
   * 检测设备能力
   * @returns 设备能力信息
   */
  private static async detectCapabilities(): Promise<DeviceCapabilities> {
    const platform = this.getPlatform();
    const isNative = this.isNative();
    
    // 检测设备类型
    const deviceType = this.detectDeviceType();
    
    // 检测屏幕信息
    const screenSize = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio || 1
    };

    // 检测安全区域
    const safeArea = this.detectSafeArea();

    // 检测刘海屏
    const hasNotch = this.detectNotch();

    return {
      platform,
      deviceType,
      isNative,
      supportsHaptics: isNative,
      supportsStatusBar: isNative,
      supportsFullscreen: true,
      hasNotch,
      screenSize,
      safeArea
    };
  }

  /**
   * 检测设备类型
   * @returns 设备类型
   */
  private static detectDeviceType(): DeviceType {
    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;

    // 检测移动设备
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      // 区分平板和手机
      if (screenWidth >= 768 || /iPad/i.test(userAgent)) {
        return DeviceType.Tablet;
      }
      return DeviceType.Mobile;
    }

    return DeviceType.Desktop;
  }

  /**
   * 检测安全区域
   * @returns 安全区域信息
   */
  private static detectSafeArea(): DeviceCapabilities['safeArea'] {
    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: this.parseCSSEnv(computedStyle.getPropertyValue('--sat') || 
                            computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
      bottom: this.parseCSSEnv(computedStyle.getPropertyValue('--sab') || 
                               computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
      left: this.parseCSSEnv(computedStyle.getPropertyValue('--sal') || 
                             computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
      right: this.parseCSSEnv(computedStyle.getPropertyValue('--sar') || 
                              computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0
    };
  }

  /**
   * 检测刘海屏
   * @returns 是否有刘海屏
   */
  private static detectNotch(): boolean {
    // iOS设备检测
    if (this.isIOS()) {
      const safeArea = this.detectSafeArea();
      return safeArea.top > 20; // iOS通常状态栏高度为20px，有刘海的设备会更高
    }

    // Android设备检测
    if (this.isAndroid()) {
      return window.innerHeight / window.innerWidth > 2; // 长宽比异常高的设备通常有刘海
    }

    return false;
  }

  /**
   * 解析CSS环境变量值
   * @param value CSS值
   * @returns 数值
   */
  private static parseCSSEnv(value: string): number {
    if (!value) return 0;
    const match = value.match(/(\d+(?:\.\d+)?)px/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * 设置状态栏样式
   */
  private static async setupStatusBar(): Promise<void> {
    if (!this.isNative()) return;

    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#00000000' }); // 透明背景
      
      if (this.isIOS()) {
        await StatusBar.setOverlaysWebView({ overlay: true });
      }
    } catch (error) {
      logger.error('Failed to setup status bar:', error);
    }
  }

  /**
   * 触发触觉反馈
   * @param type 触觉反馈类型
   */
  static async triggerHapticFeedback(type: HapticFeedbackType): Promise<void> {
    if (!this.isNative()) return;

    try {
      switch (type) {
        case HapticFeedbackType.Light:
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case HapticFeedbackType.Medium:
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case HapticFeedbackType.Heavy:
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case HapticFeedbackType.Success:
          await Haptics.notification({ type: NotificationStyle.Success });
          break;
        case HapticFeedbackType.Warning:
          await Haptics.notification({ type: NotificationStyle.Warning });
          break;
        case HapticFeedbackType.Error:
          await Haptics.notification({ type: NotificationStyle.Error });
          break;
      }
    } catch (error) {
      logger.error('Haptic feedback failed:', error);
    }
  }

  /**
   * 获取网络状态
   * @returns 网络状态信息
   */
  static async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      const status = await Network.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType
      };
    } catch (error) {
      logger.error('Failed to get network status:', error);
      return {
        connected: navigator.onLine,
        connectionType: 'unknown'
      };
    }
  }

  /**
   * 监听网络状态变化
   * @param callback 状态变化回调
   * @returns 取消监听函数
   */
  static onNetworkStatusChange(callback: (status: NetworkStatus) => void): () => void {
    let removeListener: (() => void) | null = null;

    if (this.isNative()) {
      Network.addListener('networkStatusChange', (status) => {
        callback({
          connected: status.connected,
          connectionType: status.connectionType
        });
      }).then((listener) => {
        removeListener = listener.remove;
      });
    } else {
      // Web平台监听
      const handleOnline = () => callback({ connected: true, connectionType: 'unknown' });
      const handleOffline = () => callback({ connected: false, connectionType: 'none' });

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      removeListener = () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return removeListener || (() => {});
  }

  /**
   * 监听应用状态变化
   * @param callback 状态变化回调
   * @returns 取消监听函数
   */
  static onAppStateChange(callback: (state: AppState) => void): () => void {
    if (!this.isNative()) {
      return () => {}; // Web平台不支持
    }

    let removeListener: (() => void) | null = null;

    App.addListener('appStateChange', callback).then((listener) => {
      removeListener = listener.remove;
    });

    return removeListener || (() => {});
  }

  /**
   * 获取应用信息
   * @returns 应用信息
   */
  static async getAppInfo(): Promise<{ name: string; version: string; build: string } | null> {
    if (!this.isNative()) return null;

    try {
      const info = await App.getInfo();
      return {
        name: info.name,
        version: info.version,
        build: info.build
      };
    } catch (error) {
      logger.error('Failed to get app info:', error);
      return null;
    }
  }

  /**
   * 检查设备是否支持特定功能
   * @param feature 功能名称
   * @returns 是否支持
   */
  static supportsFeature(feature: string): boolean {
    const capabilities = this.capabilities;
    if (!capabilities) return false;

    switch (feature) {
      case 'haptics':
        return capabilities.supportsHaptics;
      case 'statusBar':
        return capabilities.supportsStatusBar;
      case 'fullscreen':
        return capabilities.supportsFullscreen;
      case 'safeArea':
        return capabilities.hasNotch || capabilities.safeArea.top > 0;
      default:
        return false;
    }
  }

  /**
   * 获取设备性能等级（简单评估）
   * @returns 性能等级 1-5（5为最高）
   */
  static getPerformanceLevel(): number {
    const screenSize = this.capabilities?.screenSize;
    if (!screenSize) return 3; // 默认中等性能

    const pixelCount = screenSize.width * screenSize.height * screenSize.ratio;
    const memorySize = (navigator as any).deviceMemory || 4; // GB

    // 基于屏幕像素和内存的简单评估
    if (pixelCount > 2000000 && memorySize >= 6) return 5; // 高端设备
    if (pixelCount > 1500000 && memorySize >= 4) return 4; // 中高端设备
    if (pixelCount > 1000000 && memorySize >= 3) return 3; // 中端设备
    if (pixelCount > 500000 && memorySize >= 2) return 2;  // 中低端设备
    return 1; // 低端设备
  }
}

export default PlatformService;