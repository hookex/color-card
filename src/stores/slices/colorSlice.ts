/**
 * 颜色状态切片
 * 管理颜色相关的状态和操作
 * 
 * @description 负责处理：
 * - 当前选中颜色
 * - 颜色类型（品牌、中国色、自然色等）
 * - 颜色历史记录
 */

import { StateCreator } from 'zustand';
import { StorageService } from '../../services/storage';
import createLogger from '../../utils/logger';
import { ColorType } from '../../types';

const logger = createLogger('ColorSlice');

// 重新导出类型
export type { ColorType };

/**
 * 颜色历史记录项
 */
export interface ColorHistoryItem {
  color: string;
  timestamp: number;
  colorType: ColorType;
}

/**
 * 颜色状态接口
 */
export interface ColorState {
  // 当前状态
  color: string;
  colorType: ColorType;
  
  // 历史记录
  colorHistory: ColorHistoryItem[];
  
  // 操作方法
  setColor: (color: string) => void;
  setColorType: (colorType: ColorType) => void;
  addToColorHistory: (color: string, colorType: ColorType) => void;
  clearColorHistory: () => void;
  
  // 持久化操作
  saveColorPreferences: () => Promise<void>;
  loadColorPreferences: () => Promise<void>;
}

/**
 * 创建颜色状态切片
 */
export const createColorSlice: StateCreator<ColorState, [], [], ColorState> = (set, get) => ({
  // 初始状态
  color: '#ff6b6b',
  colorType: 'brand',
  colorHistory: [],

  // 设置当前颜色
  setColor: (color: string) => {
    set({ color });
    
    // 自动添加到历史记录
    const { addToColorHistory, colorType } = get();
    addToColorHistory(color, colorType);
    
    // 自动保存偏好设置
    const { saveColorPreferences } = get();
    saveColorPreferences();
    
    logger.info('Color changed:', color);
  },

  // 设置颜色类型
  setColorType: (colorType: ColorType) => {
    set({ colorType });
    
    // 自动保存偏好设置
    const { saveColorPreferences } = get();
    saveColorPreferences();
    
    logger.info('Color type changed:', colorType);
  },

  // 添加到历史记录
  addToColorHistory: (color: string, colorType: ColorType) => {
    const { colorHistory } = get();
    
    // 检查是否已存在相同颜色
    const existingIndex = colorHistory.findIndex(item => item.color === color);
    
    const newItem: ColorHistoryItem = {
      color,
      colorType,
      timestamp: Date.now()
    };

    let updatedHistory: ColorHistoryItem[];
    
    if (existingIndex >= 0) {
      // 如果存在，更新时间戳并移到最前面
      updatedHistory = [
        newItem,
        ...colorHistory.filter((_, index) => index !== existingIndex)
      ];
    } else {
      // 如果不存在，添加到最前面
      updatedHistory = [newItem, ...colorHistory];
    }

    // 限制历史记录数量（最多保留50个）
    if (updatedHistory.length > 50) {
      updatedHistory = updatedHistory.slice(0, 50);
    }

    set({ colorHistory: updatedHistory });
    logger.info('Color added to history:', color);
  },

  // 清空历史记录
  clearColorHistory: () => {
    set({ colorHistory: [] });
    logger.info('Color history cleared');
  },


  // 保存颜色偏好设置
  saveColorPreferences: async () => {
    try {
      const { color, colorType } = get();
      
      await StorageService.saveUserPreferences({
        color,
        colorType,
      });
      
      logger.info('Color preferences saved successfully');
    } catch (error) {
      logger.error('Failed to save color preferences:', error);
    }
  },

  // 加载颜色偏好设置
  loadColorPreferences: async () => {
    try {
      const preferences = await StorageService.loadUserPreferences();
      
      const updates: Partial<ColorState> = {};
      
      if (preferences.color) {
        updates.color = preferences.color;
      }
      
      if (preferences.colorType) {
        updates.colorType = preferences.colorType as ColorType;
      }
      
      set(updates);
      logger.info('Color preferences loaded successfully');
    } catch (error) {
      logger.error('Failed to load color preferences:', error);
    }
  }
});

export default createColorSlice;