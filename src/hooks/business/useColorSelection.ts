/**
 * 颜色选择业务逻辑Hook
 * 封装颜色选择相关的业务逻辑和状态管理
 * 
 * @description 负责处理：
 * - 颜色选择和切换
 * - 颜色类型管理
 * - 颜色历史记录
 * - 收藏功能
 * - URL同步
 */

import { useCallback, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAppStore, useAppStoreSelectors, useAppStoreActions } from '../../stores/useAppStore';
import { PlatformService, HapticFeedbackType } from '../../services/platform';
import { ColorType } from '../../stores/slices/colorSlice';
import createLogger from '../../utils/logger';

const logger = createLogger('useColorSelection');

/**
 * 颜色选择Hook接口
 */
export interface UseColorSelectionReturn {
  // 当前状态
  color: string;
  colorType: ColorType;
  colorHistory: any[];
  favoriteColors: string[];
  
  // 操作方法
  selectColor: (color: string) => Promise<void>;
  changeColorType: (colorType: ColorType) => Promise<void>;
  toggleFavorite: (color: string) => Promise<void>;
  clearColorHistory: () => void;
  
  // 查询方法
  isFavorite: (color: string) => boolean;
  getRecentColors: (limit?: number) => string[];
}

/**
 * 颜色选择业务逻辑Hook
 */
export const useColorSelection = (): UseColorSelectionReturn => {
  const history = useHistory();
  const location = useLocation();
  
  // 状态选择器
  const color = useAppStoreSelectors.useColor();
  const colorType = useAppStoreSelectors.useColorType();
  const colorHistory = useAppStoreSelectors.useColorHistory();
  const favoriteColors = useAppStoreSelectors.useFavoriteColors();
  
  // 操作方法
  const { setColor, setColorType, addToFavorites, removeFromFavorites, clearHistory, isFavorite } = useAppStoreActions.useColorActions();

  /**
   * 更新URL参数
   */
  const updateUrlParams = useCallback((newColorType?: ColorType) => {
    const urlParams = new URLSearchParams(location.search);
    
    if (newColorType) {
      urlParams.set('colorType', newColorType);
    }
    
    // 使用replace避免在浏览器历史中创建过多条目
    history.replace({
      pathname: location.pathname,
      search: urlParams.toString()
    });
  }, [history, location]);

  /**
   * 从URL初始化颜色类型
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlColorType = urlParams.get('colorType') as ColorType;
    
    if (urlColorType && urlColorType !== colorType) {
      // 验证colorType是否有效
      const validColorTypes: ColorType[] = ['brand', 'chinese', 'nature', 'food', 'mood', 'space'];
      if (validColorTypes.includes(urlColorType)) {
        setColorType(urlColorType);
        logger.info('Initialized colorType from URL:', urlColorType);
      }
    }
  }, [location.search, colorType, setColorType]);

  /**
   * 选择颜色
   */
  const selectColor = useCallback(async (newColor: string) => {
    logger.info('Selecting color:', newColor);
    
    try {
      // 更新颜色状态
      setColor(newColor);
      
      // 触发触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);
      
      logger.info('Color selected successfully:', newColor);
    } catch (error) {
      logger.error('Failed to select color:', error);
    }
  }, [setColor]);

  /**
   * 改变颜色类型
   */
  const changeColorType = useCallback(async (newColorType: ColorType) => {
    if (!newColorType || newColorType === colorType) return;
    
    logger.info('Changing color type:', newColorType);
    
    try {
      // 更新颜色类型
      setColorType(newColorType);
      
      // 更新URL参数
      updateUrlParams(newColorType);
      
      // 触发触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);
      
      logger.info('Color type changed successfully:', newColorType);
    } catch (error) {
      logger.error('Failed to change color type:', error);
    }
  }, [colorType, setColorType, updateUrlParams]);

  /**
   * 切换收藏状态
   */
  const toggleFavorite = useCallback(async (targetColor: string) => {
    try {
      if (isFavorite(targetColor)) {
        removeFromFavorites(targetColor);
        await PlatformService.triggerHapticFeedback(HapticFeedbackType.Warning);
        logger.info('Color removed from favorites:', targetColor);
      } else {
        addToFavorites(targetColor);
        await PlatformService.triggerHapticFeedback(HapticFeedbackType.Success);
        logger.info('Color added to favorites:', targetColor);
      }
    } catch (error) {
      logger.error('Failed to toggle favorite:', error);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  /**
   * 清空颜色历史
   */
  const clearColorHistory = useCallback(() => {
    clearHistory();
    logger.info('Color history cleared');
  }, [clearHistory]);

  /**
   * 获取最近使用的颜色
   */
  const getRecentColors = useCallback((limit: number = 10): string[] => {
    return colorHistory
      .slice(0, limit)
      .map(item => item.color);
  }, [colorHistory]);

  return {
    // 状态
    color,
    colorType,
    colorHistory,
    favoriteColors,
    
    // 操作方法
    selectColor,
    changeColorType,
    toggleFavorite,
    clearColorHistory,
    
    // 查询方法
    isFavorite,
    getRecentColors
  };
};

export default useColorSelection;