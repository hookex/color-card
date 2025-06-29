/**
 * Capacitor Hook
 * 提供在React组件中使用Capacitor功能的便捷接口
 */

import { useEffect, useState, useCallback } from 'react';
import { AppState } from '@capacitor/app';
import { ConnectionStatus } from '@capacitor/network';
import { DeviceInfo } from '@capacitor/device';
import { 
  capacitorService, 
  // wallpaperService,
  // deepLinkService,
  type PlatformInfo,
  type HapticsOptions,
  type ShareOptions
  // type WallpaperOptions
} from '../../services/capacitor';
import createLogger from '../../utils/logger';

const logger = createLogger('useCapacitor');

// 临时类型定义（当真正的服务可用时移除）
type WallpaperOptions = {
  quality?: number;
  format?: 'png' | 'jpg';
  width?: number;
  height?: number;
};

export interface CapacitorState {
  platformInfo: PlatformInfo | null;
  networkStatus: ConnectionStatus | null;
  deviceInfo: DeviceInfo | null;
  appState: AppState | null;
  keyboardHeight: number;
  isInitialized: boolean;
}

export interface CapacitorActions {
  // 触觉反馈
  hapticFeedback: (options?: HapticsOptions) => Promise<void>;
  
  // 分享功能
  share: (options: ShareOptions) => Promise<void>;
  
  // 偏好设置
  setPreference: (key: string, value: string) => Promise<void>;
  getPreference: (key: string) => Promise<string | null>;
  removePreference: (key: string) => Promise<void>;
  clearPreferences: () => Promise<void>;
  
  // 壁纸功能
  generateWallpaperFromElement: (element: HTMLElement, options?: WallpaperOptions) => Promise<any>;
  generateWallpaperFromCanvas: (canvas: HTMLCanvasElement, options?: WallpaperOptions) => Promise<any>;
  getOptimalWallpaperSize: () => { width: number; height: number };
  
  // 深度链接
  shareCurrentConfig: (config: any) => Promise<void>;
  generateShareUrl: (type: string, data: any) => string;
  
  // 键盘
  hideKeyboard: () => Promise<void>;
  
  // 平台检测
  isNative: () => boolean;
  isHybrid: () => boolean;
  getPlatform: () => 'ios' | 'android' | 'web';
}

export function useCapacitor() {
  const [state, setState] = useState<CapacitorState>({
    platformInfo: null,
    networkStatus: null,
    deviceInfo: null,
    appState: null,
    keyboardHeight: 0,
    isInitialized: false
  });

  // 初始化Capacitor服务
  useEffect(() => {
    let isMounted = true;

    const initializeServices = async () => {
      try {
        logger.info('初始化Capacitor服务');
        
        // 初始化核心服务
        await capacitorService.initialize();
        // await deepLinkService.initialize();
        
        if (isMounted) {
          const platformInfo = capacitorService.getPlatformInfo();
          const networkStatus = await capacitorService.getNetworkStatus();
          const deviceInfo = await capacitorService.getDeviceInfo();
          
          setState(prev => ({
            ...prev,
            platformInfo,
            networkStatus,
            deviceInfo,
            isInitialized: true
          }));
          
          logger.info('Capacitor服务初始化完成', { platformInfo });
        }
        
      } catch (error) {
        logger.error('Capacitor服务初始化失败', error);
        if (isMounted) {
          setState(prev => ({ ...prev, isInitialized: false }));
        }
      }
    };

    initializeServices();

    return () => {
      isMounted = false;
    };
  }, []);

  // 设置事件监听器
  useEffect(() => {
    if (!state.isInitialized) return;

    // 应用状态监听器
    const appStateListener = (appState: AppState) => {
      setState(prev => ({ ...prev, appState }));
    };

    // 网络状态监听器
    const networkListener = (networkStatus: ConnectionStatus) => {
      setState(prev => ({ ...prev, networkStatus }));
    };

    // 键盘监听器
    const keyboardListener = (info: { keyboardHeight: number }) => {
      setState(prev => ({ ...prev, keyboardHeight: info.keyboardHeight }));
    };

    // 深度链接监听器
    const deepLinkListeners = {
      color: (event: CustomEvent) => {
        logger.info('收到颜色深度链接', event.detail);
      },
      texture: (event: CustomEvent) => {
        logger.info('收到纹理深度链接', event.detail);
      },
      colorType: (event: CustomEvent) => {
        logger.info('收到颜色类型深度链接', event.detail);
      },
      wallpaperConfig: (event: CustomEvent) => {
        logger.info('收到壁纸配置深度链接', event.detail);
      },
      notification: (event: CustomEvent) => {
        logger.info('深度链接通知', event.detail);
        // 这里可以显示Toast通知
      }
    };

    // 注册监听器
    capacitorService.addAppStateListener(appStateListener);
    capacitorService.addNetworkListener(networkListener);
    capacitorService.addKeyboardListener(keyboardListener);

    // 注册深度链接事件监听器
    Object.entries(deepLinkListeners).forEach(([eventType, listener]) => {
      window.addEventListener(`deeplink:${eventType}`, listener as EventListener);
    });

    return () => {
      // 清理监听器
      capacitorService.removeAppStateListener(appStateListener);
      capacitorService.removeNetworkListener(networkListener);
      capacitorService.removeKeyboardListener(keyboardListener);

      // 清理深度链接监听器
      Object.entries(deepLinkListeners).forEach(([eventType, listener]) => {
        window.removeEventListener(`deeplink:${eventType}`, listener as EventListener);
      });
    };
  }, [state.isInitialized]);

  // 创建动作对象
  const actions = useCallback((): CapacitorActions => ({
    // 触觉反馈
    hapticFeedback: async (options?: HapticsOptions) => {
      try {
        await capacitorService.hapticFeedback(options);
      } catch (error) {
        logger.error('触觉反馈失败', error);
      }
    },

    // 分享功能
    share: async (options: ShareOptions) => {
      try {
        await capacitorService.share(options);
      } catch (error) {
        logger.error('分享失败', error);
        throw error;
      }
    },

    // 偏好设置
    setPreference: async (key: string, value: string) => {
      try {
        await capacitorService.setPreference(key, value);
      } catch (error) {
        logger.error('设置偏好失败', error);
        throw error;
      }
    },

    getPreference: async (key: string) => {
      try {
        return await capacitorService.getPreference(key);
      } catch (error) {
        logger.error('获取偏好失败', error);
        return null;
      }
    },

    removePreference: async (key: string) => {
      try {
        await capacitorService.removePreference(key);
      } catch (error) {
        logger.error('删除偏好失败', error);
        throw error;
      }
    },

    clearPreferences: async () => {
      try {
        await capacitorService.clearPreferences();
      } catch (error) {
        logger.error('清空偏好失败', error);
        throw error;
      }
    },

    // 壁纸功能
    generateWallpaperFromElement: async (element: HTMLElement, options?: WallpaperOptions) => {
      try {
        // return await wallpaperService.generateFromElement(element, options);
        throw new Error('Wallpaper service not available');
      } catch (error) {
        logger.error('从元素生成壁纸失败', error);
        throw error;
      }
    },

    generateWallpaperFromCanvas: async (canvas: HTMLCanvasElement, options?: WallpaperOptions) => {
      try {
        // return await wallpaperService.generateFromCanvas(canvas, options);
        throw new Error('Wallpaper service not available');
      } catch (error) {
        logger.error('从Canvas生成壁纸失败', error);
        throw error;
      }
    },

    getOptimalWallpaperSize: () => {
      // return wallpaperService.getOptimalWallpaperSize();
      return { width: 1170, height: 2532 }; // iPhone 默认尺寸
    },

    // 深度链接
    shareCurrentConfig: async (config: any) => {
      try {
        // await deepLinkService.shareCurrentConfig(config);
        throw new Error('Deep link service not available');
      } catch (error) {
        logger.error('分享配置失败', error);
        throw error;
      }
    },

    generateShareUrl: (type: string, data: any) => {
      // return deepLinkService.generateShareUrl(type as any, data);
      return `https://colorcard.app/share?type=${type}&data=${encodeURIComponent(JSON.stringify(data))}`;
    },

    // 键盘
    hideKeyboard: async () => {
      try {
        await capacitorService.hideKeyboard();
      } catch (error) {
        logger.error('隐藏键盘失败', error);
      }
    },

    // 平台检测
    isNative: () => capacitorService.isNative(),
    isHybrid: () => capacitorService.isHybrid(),
    getPlatform: () => capacitorService.getPlatform()
  }), []);

  // 清理资源（组件卸载时）
  useEffect(() => {
    return () => {
      if (state.isInitialized) {
        capacitorService.cleanup().catch(error => {
          logger.error('Capacitor服务清理失败', error);
        });
        // deepLinkService.cleanup().catch(error => {
        //   logger.error('深度链接服务清理失败', error);
        // });
      }
    };
  }, [state.isInitialized]);

  return {
    ...state,
    ...actions()
  };
}

export default useCapacitor;