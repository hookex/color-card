/**
 * 纹理状态切片
 * 管理纹理相关的状态和操作
 * 
 * @description 负责处理：
 * - 当前选中纹理
 * - 纹理参数配置
 * - 纹理历史记录
 * - 纹理预设管理
 */

import { StateCreator } from 'zustand';
import { StorageService } from '../../services/storage';
import createLogger from '../../utils/logger';
import { TextureType } from '../../types';

const logger = createLogger('TextureSlice');

// 重新导出类型
export type { TextureType };

/**
 * 纹理配置参数
 */
export interface TextureConfig {
  intensity?: number;
  scale?: number;
  opacity?: number;
  blur?: number;
  [key: string]: any;
}

/**
 * 纹理历史记录项
 */
export interface TextureHistoryItem {
  texture: TextureType;
  config?: TextureConfig;
  timestamp: number;
}

/**
 * 纹理预设
 */
export interface TexturePreset {
  id: string;
  name: string;
  texture: TextureType;
  config: TextureConfig;
  thumbnail?: string;
}

/**
 * 纹理状态接口
 */
export interface TextureState {
  // 当前状态
  texture: TextureType;
  textureConfig: TextureConfig;
  
  // 历史记录
  textureHistory: TextureHistoryItem[];
  
  // 预设管理
  customPresets: TexturePreset[];
  
  // 操作方法
  setTexture: (texture: TextureType) => void;
  setTextureConfig: (config: TextureConfig) => void;
  updateTextureParameter: (key: string, value: any) => void;
  addToTextureHistory: (texture: TextureType, config?: TextureConfig) => void;
  clearTextureHistory: () => void;
  
  // 预设管理
  savePreset: (name: string, thumbnail?: string) => void;
  deletePreset: (id: string) => void;
  applyPreset: (preset: TexturePreset) => void;
  
  // 工具方法
  isCanvasTexture: (texture?: TextureType) => boolean;
  getTextureDisplayName: (texture: TextureType) => string;
  
  // 持久化操作
  saveTexturePreferences: () => Promise<void>;
  loadTexturePreferences: () => Promise<void>;
}

/**
 * 纹理显示名称映射
 */
const TEXTURE_DISPLAY_NAMES: Record<TextureType, string> = {
  solid: '原色',
  linear: '线性',
  leather: '皮革',
  paint: '玉石',
  glass: '玻璃',
  glow: '辉光',
  frosted: '毛玻璃'
};

/**
 * 需要使用Canvas渲染的纹理类型
 */
const CANVAS_TEXTURES: TextureType[] = ['paint', 'frosted'];

/**
 * 创建纹理状态切片
 */
export const createTextureSlice: StateCreator<TextureState, [], [], TextureState> = (set, get) => ({
  // 初始状态
  texture: 'solid',
  textureConfig: {},
  textureHistory: [],
  customPresets: [],

  // 设置当前纹理
  setTexture: (texture: TextureType) => {
    set({ texture });
    
    // 自动添加到历史记录
    const { addToTextureHistory, textureConfig } = get();
    addToTextureHistory(texture, textureConfig);
    
    // 自动保存偏好设置
    const { saveTexturePreferences } = get();
    saveTexturePreferences();
    
    logger.info('Texture changed:', texture);
  },

  // 设置纹理配置
  setTextureConfig: (config: TextureConfig) => {
    set({ textureConfig: config });
    logger.info('Texture config changed:', config);
  },

  // 更新纹理参数
  updateTextureParameter: (key: string, value: any) => {
    const { textureConfig } = get();
    const updatedConfig = {
      ...textureConfig,
      [key]: value
    };
    
    set({ textureConfig: updatedConfig });
    logger.info(`Texture parameter updated: ${key} = ${value}`);
  },

  // 添加到历史记录
  addToTextureHistory: (texture: TextureType, config?: TextureConfig) => {
    const { textureHistory } = get();
    
    // 检查是否已存在相同配置
    const existingIndex = textureHistory.findIndex(item => 
      item.texture === texture && 
      JSON.stringify(item.config) === JSON.stringify(config)
    );
    
    const newItem: TextureHistoryItem = {
      texture,
      config: config ? { ...config } : undefined,
      timestamp: Date.now()
    };

    let updatedHistory: TextureHistoryItem[];
    
    if (existingIndex >= 0) {
      // 如果存在，更新时间戳并移到最前面
      updatedHistory = [
        newItem,
        ...textureHistory.filter((_, index) => index !== existingIndex)
      ];
    } else {
      // 如果不存在，添加到最前面
      updatedHistory = [newItem, ...textureHistory];
    }

    // 限制历史记录数量（最多保留30个）
    if (updatedHistory.length > 30) {
      updatedHistory = updatedHistory.slice(0, 30);
    }

    set({ textureHistory: updatedHistory });
    logger.info('Texture added to history:', texture);
  },

  // 清空历史记录
  clearTextureHistory: () => {
    set({ textureHistory: [] });
    logger.info('Texture history cleared');
  },

  // 保存预设
  savePreset: (name: string, thumbnail?: string) => {
    const { texture, textureConfig, customPresets } = get();
    
    const newPreset: TexturePreset = {
      id: `preset_${Date.now()}`,
      name,
      texture,
      config: { ...textureConfig },
      thumbnail
    };

    const updatedPresets = [...customPresets, newPreset];
    set({ customPresets: updatedPresets });
    
    // 自动保存到存储
    StorageService.setCache('texturePresets', updatedPresets);
    
    logger.info('Texture preset saved:', name);
  },

  // 删除预设
  deletePreset: (id: string) => {
    const { customPresets } = get();
    const updatedPresets = customPresets.filter(preset => preset.id !== id);
    set({ customPresets: updatedPresets });
    
    // 自动保存到存储
    StorageService.setCache('texturePresets', updatedPresets);
    
    logger.info('Texture preset deleted:', id);
  },

  // 应用预设
  applyPreset: (preset: TexturePreset) => {
    set({
      texture: preset.texture,
      textureConfig: { ...preset.config }
    });
    
    // 添加到历史记录
    const { addToTextureHistory } = get();
    addToTextureHistory(preset.texture, preset.config);
    
    // 自动保存偏好设置
    const { saveTexturePreferences } = get();
    saveTexturePreferences();
    
    logger.info('Texture preset applied:', preset.name);
  },

  // 检查是否为Canvas纹理
  isCanvasTexture: (texture?: TextureType) => {
    const currentTexture = texture || get().texture;
    return CANVAS_TEXTURES.includes(currentTexture);
  },

  // 获取纹理显示名称
  getTextureDisplayName: (texture: TextureType) => {
    return TEXTURE_DISPLAY_NAMES[texture] || texture;
  },

  // 保存纹理偏好设置
  saveTexturePreferences: async () => {
    try {
      const { texture, textureConfig } = get();
      
      await StorageService.saveUserPreferences({
        texture,
      });

      // 单独保存纹理配置
      await StorageService.setCache('textureConfig', textureConfig);
      
      logger.info('Texture preferences saved successfully');
    } catch (error) {
      logger.error('Failed to save texture preferences:', error);
    }
  },

  // 加载纹理偏好设置
  loadTexturePreferences: async () => {
    try {
      const preferences = await StorageService.loadUserPreferences();
      const textureConfig = await StorageService.getCache<TextureConfig>('textureConfig') || {};
      const customPresets = await StorageService.getCache<TexturePreset[]>('texturePresets') || [];
      
      const updates: Partial<TextureState> = {};
      
      if (preferences.texture) {
        updates.texture = preferences.texture as TextureType;
      }
      
      updates.textureConfig = textureConfig;
      updates.customPresets = customPresets;
      
      set(updates);
      logger.info('Texture preferences loaded successfully');
    } catch (error) {
      logger.error('Failed to load texture preferences:', error);
    }
  }
});

export default createTextureSlice;