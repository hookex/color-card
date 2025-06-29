/**
 * 应用主状态存储
 * 基于 Zustand 的现代状态管理解决方案
 * Combines all state slices into a unified store
 * 
 * @description 特性：
 * - 模块化状态切片架构
 * - 自动持久化
 * - TypeScript完整支持
 * - DevTools集成
 * - 性能优化
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { createColorSlice, ColorState } from './slices/colorSlice';
import { createTextureSlice, TextureState } from './slices/textureSlice';
import { createAppSlice, AppState } from './slices/appSlice';
import createLogger from '../utils/logger';

const logger = createLogger('AppStore');

/**
 * 应用完整状态接口
 * 组合所有状态切片
 */
export interface AppStoreState extends ColorState, TextureState, AppState {
  // 全局操作方法
  resetStore: () => void;
  initializeStore: () => Promise<void>;
}

/**
 * 创建应用状态存储
 */
export const useAppStore = create<AppStoreState>()(
  devtools(
    subscribeWithSelector(
      (set, get, api) => ({
        // 组合所有状态切片
        ...createColorSlice(set, get, api),
        ...createTextureSlice(set, get, api),
        ...createAppSlice(set, get, api),

        // 全局操作方法
        resetStore: () => {
          // 重置到初始状态
          set({
            // 颜色状态重置
            color: '#ff6b6b',
            colorType: 'brand',
            colorHistory: [],
            favoriteColors: [],
            
            // 纹理状态重置
            texture: 'solid',
            textureConfig: {},
            textureHistory: [],
            customPresets: [],
            
            // 应用状态重置
            debug: false,
            mode: 'normal',
            hideColorCard: false,
            isMinimized: false,
            isLoading: false,
            isTransitioning: false,
            showSaveButton: false
          });
          
          logger.info('Store reset to initial state');
        },

        // 初始化存储
        initializeStore: async () => {
          try {
            set({ isLoading: true });
            
            // 初始化应用
            await get().initializeApp();
            
            // 加载所有偏好设置
            await Promise.all([
              get().loadColorPreferences(),
              get().loadTexturePreferences(),
              get().loadAppPreferences()
            ]);
            
            set({ isLoading: false });
            logger.info('Store initialized successfully');
          } catch (error) {
            logger.error('Failed to initialize store:', error);
            set({ isLoading: false });
          }
        }
      })
    ),
    {
      name: 'color-card-store', // Redux DevTools中显示的名称
      enabled: process.env.NODE_ENV === 'development' // 仅在开发环境启用DevTools
    }
  )
);

/**
 * 状态选择器工具函数
 * 提供常用的状态选择器以提高性能
 */
export const useAppStoreSelectors = {
  // 颜色相关选择器
  useColor: () => useAppStore(state => state.color),
  useColorType: () => useAppStore(state => state.colorType),
  useColorHistory: () => useAppStore(state => state.colorHistory),
  useFavoriteColors: () => useAppStore(state => state.favoriteColors),
  
  // 纹理相关选择器
  useTexture: () => useAppStore(state => state.texture),
  useTextureConfig: () => useAppStore(state => state.textureConfig),
  useTextureHistory: () => useAppStore(state => state.textureHistory),
  useCustomPresets: () => useAppStore(state => state.customPresets),
  useIsCanvasTexture: () => useAppStore(state => state.isCanvasTexture(state.texture)),
  
  // 应用状态相关选择器
  useDebug: () => useAppStore(state => state.debug),
  useMode: () => useAppStore(state => state.mode),
  useHideColorCard: () => useAppStore(state => state.hideColorCard),
  useIsMinimized: () => useAppStore(state => state.isMinimized),
  useIsLoading: () => useAppStore(state => state.isLoading),
  useIsTransitioning: () => useAppStore(state => state.isTransitioning),
  useShowSaveButton: () => useAppStore(state => state.showSaveButton),
  useIsNativePlatform: () => useAppStore(state => state.isNativePlatform),
  
  // 组合选择器
  useCurrentSelection: () => useAppStore(state => ({
    color: state.color,
    texture: state.texture,
    colorType: state.colorType,
    textureConfig: state.textureConfig
  })),
  
  useUIState: () => useAppStore(state => ({
    isLoading: state.isLoading,
    isTransitioning: state.isTransitioning,
    isMinimized: state.isMinimized,
    hideColorCard: state.hideColorCard,
    showSaveButton: state.showSaveButton
  }))
};

/**
 * 状态操作工具函数
 * 提供常用的操作方法集合
 */
export const useAppStoreActions = {
  // 颜色操作
  useColorActions: () => useAppStore(state => ({
    setColor: state.setColor,
    setColorType: state.setColorType,
    addToFavorites: state.addToFavorites,
    removeFromFavorites: state.removeFromFavorites,
    clearHistory: state.clearHistory
  })),
  
  // 纹理操作  
  useTextureActions: () => useAppStore(state => ({
    setTexture: state.setTexture,
    setTextureConfig: state.setTextureConfig,
    updateTextureParameter: state.updateTextureParameter,
    savePreset: state.savePreset,
    deletePreset: state.deletePreset,
    applyPreset: state.applyPreset
  })),
  
  // 应用操作
  useAppActions: () => useAppStore(state => ({
    setDebug: state.setDebug,
    setMode: state.setMode,
    setHideColorCard: state.setHideColorCard,
    setIsMinimized: state.setIsMinimized,
    toggleDebug: state.toggleDebug,
    toggleMinimized: state.toggleMinimized,
    toggleColorCard: state.toggleColorCard
  })),
  
  // 全局操作
  useGlobalActions: () => useAppStore(state => ({
    resetStore: state.resetStore,
    initializeStore: state.initializeStore
  }))
};

/**
 * 性能监控Hook
 * 在开发环境下监控状态变化性能
 */
export const useStorePerformanceMonitor = () => {
  if (process.env.NODE_ENV === 'development') {
    useAppStore.subscribe(
      (state) => state,
      (state, prevState) => {
        const changes = Object.keys(state).filter(
          key => state[key as keyof typeof state] !== prevState[key as keyof typeof prevState]
        );
        
        if (changes.length > 0) {
          logger.info('Store state changed:', changes);
        }
      }
    );
  }
};

export default useAppStore;