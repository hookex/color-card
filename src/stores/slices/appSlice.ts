/**
 * 应用状态切片
 * 管理应用级别的状态和设置
 * 
 * @description 负责处理：
 * - 调试模式
 * - UI显示状态
 * - 应用模式
 * - 全局设置
 */

import { StateCreator } from 'zustand';
import { StorageService } from '../../services/storage';
import { PlatformService } from '../../services/platform';
import createLogger from '../../utils/logger';

const logger = createLogger('AppSlice');

/**
 * 应用模式类型
 */
export type AppMode = 'normal' | 'fullscreen' | 'minimal';

/**
 * 应用状态接口
 */
export interface AppState {
  // 基本状态
  debug: boolean;
  mode: AppMode;
  hideColorCard: boolean;
  isMinimized: boolean;
  
  // UI状态
  isLoading: boolean;
  isTransitioning: boolean;
  showSaveButton: boolean;
  
  // 设备和平台信息
  isNativePlatform: boolean;
  deviceType: string;
  
  // 操作方法
  setDebug: (debug: boolean) => void;
  setMode: (mode: AppMode) => void;
  setHideColorCard: (hide: boolean) => void;
  setIsMinimized: (minimized: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsTransitioning: (transitioning: boolean) => void;
  setShowSaveButton: (show: boolean) => void;
  
  // 工具方法
  toggleDebug: () => void;
  toggleMinimized: () => void;
  toggleColorCard: () => void;
  resetScene: () => void;
  
  // 教程状态
  hasCompletedTutorial: boolean;
  setHasCompletedTutorial: (completed: boolean) => void;
  
  // 持久化操作
  saveAppPreferences: () => Promise<void>;
  loadAppPreferences: () => Promise<void>;
  initializeApp: () => Promise<void>;
}

/**
 * 创建应用状态切片
 */
export const createAppSlice: StateCreator<AppState, [], [], AppState> = (set, get) => ({
  // 初始状态
  debug: false,
  mode: 'normal',
  hideColorCard: false,
  isMinimized: false,
  
  // UI状态
  isLoading: false,
  isTransitioning: false,
  showSaveButton: false,
  
  // 设备信息
  isNativePlatform: false,
  deviceType: 'unknown',
  
  // 教程状态
  hasCompletedTutorial: false,

  // 设置调试模式
  setDebug: (debug: boolean) => {
    set({ debug });
    
    // 自动保存偏好设置
    const { saveAppPreferences } = get();
    saveAppPreferences();
    
    logger.info('Debug mode changed:', debug);
  },

  // 设置应用模式
  setMode: (mode: AppMode) => {
    set({ mode });
    
    // 自动保存偏好设置
    const { saveAppPreferences } = get();
    saveAppPreferences();
    
    logger.info('App mode changed:', mode);
  },

  // 设置隐藏颜色卡片
  setHideColorCard: (hide: boolean) => {
    set({ 
      hideColorCard: hide,
      showSaveButton: hide // 隐藏颜色卡片时显示保存按钮
    });
    
    // 自动保存偏好设置
    const { saveAppPreferences } = get();
    saveAppPreferences();
    
    logger.info('Hide color card changed:', hide);
  },

  // 设置最小化状态
  setIsMinimized: (minimized: boolean) => {
    set({ isMinimized: minimized });
    logger.info('Minimized state changed:', minimized);
  },

  // 设置加载状态
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // 设置过渡状态
  setIsTransitioning: (transitioning: boolean) => {
    set({ isTransitioning: transitioning });
  },

  // 设置保存按钮显示状态
  setShowSaveButton: (show: boolean) => {
    set({ showSaveButton: show });
  },

  // 切换调试模式
  toggleDebug: () => {
    const { debug, setDebug } = get();
    setDebug(!debug);
  },

  // 切换最小化状态
  toggleMinimized: () => {
    const { isMinimized, setIsMinimized } = get();
    setIsMinimized(!isMinimized);
  },

  // 切换颜色卡片显示
  toggleColorCard: () => {
    const { hideColorCard, setHideColorCard } = get();
    setHideColorCard(!hideColorCard);
  },

  // 重置场景
  resetScene: () => {
    logger.info('Scene reset requested');
    // 这个方法可以被其他组件调用来重置3D场景
  },

  // 设置教程完成状态
  setHasCompletedTutorial: (completed: boolean) => {
    set({ hasCompletedTutorial: completed });
    logger.info('Tutorial completion status changed:', completed);
  },

  // 保存应用偏好设置
  saveAppPreferences: async () => {
    try {
      const { debug, mode, hideColorCard } = get();
      
      await StorageService.saveUserPreferences({
        debug,
        mode,
        hideColorCard,
      });
      
      // 保存应用状态
      await StorageService.saveAppState({
        lastUsed: Date.now(),
        version: '1.0.0' // 可以从package.json获取
      });
      
      logger.info('App preferences saved successfully');
    } catch (error) {
      logger.error('Failed to save app preferences:', error);
    }
  },

  // 加载应用偏好设置
  loadAppPreferences: async () => {
    try {
      const preferences = await StorageService.loadUserPreferences();
      
      const updates: Partial<AppState> = {};
      
      if (preferences.debug !== undefined) {
        updates.debug = preferences.debug;
      }
      
      if (preferences.mode) {
        updates.mode = preferences.mode as AppMode;
      }
      
      if (preferences.hideColorCard !== undefined) {
        updates.hideColorCard = preferences.hideColorCard;
        updates.showSaveButton = preferences.hideColorCard; // 隐藏颜色卡片时显示保存按钮
      }
      
      set(updates);
      logger.info('App preferences loaded successfully');
    } catch (error) {
      logger.error('Failed to load app preferences:', error);
    }
  },

  // 初始化应用
  initializeApp: async () => {
    try {
      set({ isLoading: true });
      
      // 初始化平台服务
      await PlatformService.initialize();
      
      // 获取平台信息
      const isNativePlatform = PlatformService.isNative();
      const capabilities = await PlatformService.getCapabilities();
      
      set({
        isNativePlatform,
        deviceType: capabilities.deviceType
      });
      
      // 加载偏好设置
      await get().loadAppPreferences();
      
      // 检查是否为首次启动
      const appState = await StorageService.loadAppState();
      if (appState.firstLaunch === undefined) {
        // 首次启动，保存标记
        await StorageService.saveAppState({
          firstLaunch: false,
          version: '1.0.0',
          lastUsed: Date.now()
        });
        
        logger.info('First app launch detected');
      }
      
      set({ isLoading: false });
      logger.info('App initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize app:', error);
      set({ isLoading: false });
    }
  }
});

export default createAppSlice;