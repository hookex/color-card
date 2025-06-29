/**
 * 纹理管理业务逻辑Hook
 * 封装纹理选择和配置相关的业务逻辑
 * 
 * @description 负责处理：
 * - 纹理选择和切换
 * - 纹理参数配置
 * - 纹理预设管理
 * - 渲染模式判断
 * - URL同步
 */

import { useCallback, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAppStoreSelectors, useAppStoreActions } from '../../stores/useAppStore';
import { PlatformService, HapticFeedbackType } from '../../services/platform';
import { TextureType, TextureConfig, TexturePreset } from '../../stores/slices/textureSlice';
import createLogger from '../../utils/logger';

const logger = createLogger('useTextureManagement');

/**
 * 纹理管理Hook接口
 */
export interface UseTextureManagementReturn {
  // 当前状态
  texture: TextureType;
  textureConfig: TextureConfig;
  textureHistory: any[];
  customPresets: TexturePreset[];
  
  // 操作方法
  selectTexture: (texture: TextureType) => Promise<void>;
  updateTextureParameter: (key: string, value: any) => void;
  saveCurrentAsPreset: (name: string, thumbnail?: string) => void;
  applyPreset: (preset: TexturePreset) => void;
  deletePreset: (id: string) => void;
  clearTextureHistory: () => void;
  
  // 查询方法
  isCanvasTexture: (texture?: TextureType) => boolean;
  getTextureDisplayName: (texture: TextureType) => string;
  shouldUseCanvas: () => boolean;
}

/**
 * 纹理管理业务逻辑Hook
 */
export const useTextureManagement = (): UseTextureManagementReturn => {
  const history = useHistory();
  const location = useLocation();
  
  // 状态选择器
  const texture = useAppStoreSelectors.useTexture();
  const textureConfig = useAppStoreSelectors.useTextureConfig();
  const textureHistory = useAppStoreSelectors.useTextureHistory();
  const customPresets = useAppStoreSelectors.useCustomPresets();
  const isCanvasTextureSelector = useAppStoreSelectors.useIsCanvasTexture();
  
  // 操作方法
  const { 
    setTexture, 
    setTextureConfig, 
    updateTextureParameter: updateParameter,
    savePreset,
    deletePreset: removePreset,
    applyPreset: applyTexturePreset,
    isCanvasTexture,
    getTextureDisplayName
  } = useAppStoreActions.useTextureActions();

  /**
   * 更新URL参数
   */
  const updateUrlParams = useCallback((newTexture?: TextureType) => {
    const urlParams = new URLSearchParams(location.search);
    
    if (newTexture) {
      urlParams.set('texture', newTexture);
    }
    
    // 使用replace避免在浏览器历史中创建过多条目
    history.replace({
      pathname: location.pathname,
      search: urlParams.toString()
    });
  }, [history, location]);

  /**
   * 从URL初始化纹理
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlTexture = urlParams.get('texture') as TextureType;
    
    if (urlTexture && urlTexture !== texture) {
      // 验证texture类型是否有效
      const validTextures: TextureType[] = ['solid', 'leather', 'paint', 'glass', 'linear', 'glow', 'frosted'];
      if (validTextures.includes(urlTexture)) {
        setTexture(urlTexture);
        logger.info('Initialized texture from URL:', urlTexture);
      }
    }
  }, [location.search, texture, setTexture]);

  /**
   * 选择纹理
   */
  const selectTexture = useCallback(async (newTexture: TextureType) => {
    logger.info('Selecting texture:', newTexture);
    
    try {
      // 更新纹理状态
      setTexture(newTexture);
      
      // 更新URL参数
      updateUrlParams(newTexture);
      
      // 触发触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);
      
      logger.info('Texture selected successfully:', newTexture);
    } catch (error) {
      logger.error('Failed to select texture:', error);
    }
  }, [setTexture, updateUrlParams]);

  /**
   * 更新纹理参数
   */
  const updateTextureParameter = useCallback((key: string, value: any) => {
    updateParameter(key, value);
    logger.info(`Texture parameter updated: ${key} = ${value}`);
  }, [updateParameter]);

  /**
   * 保存当前配置为预设
   */
  const saveCurrentAsPreset = useCallback((name: string, thumbnail?: string) => {
    try {
      savePreset(name, thumbnail);
      logger.info('Texture preset saved:', name);
    } catch (error) {
      logger.error('Failed to save texture preset:', error);
    }
  }, [savePreset]);

  /**
   * 应用预设
   */
  const applyPreset = useCallback((preset: TexturePreset) => {
    try {
      applyTexturePreset(preset);
      
      // 更新URL参数
      updateUrlParams(preset.texture);
      
      logger.info('Texture preset applied:', preset.name);
    } catch (error) {
      logger.error('Failed to apply texture preset:', error);
    }
  }, [applyTexturePreset, updateUrlParams]);

  /**
   * 删除预设
   */
  const deletePreset = useCallback((id: string) => {
    try {
      removePreset(id);
      logger.info('Texture preset deleted:', id);
    } catch (error) {
      logger.error('Failed to delete texture preset:', error);
    }
  }, [removePreset]);

  /**
   * 清空纹理历史
   */
  const clearTextureHistory = useCallback(() => {
    // 这里需要添加clearHistory方法到textureActions
    logger.info('Clear texture history requested');
  }, []);

  /**
   * 判断是否应该使用Canvas渲染
   */
  const shouldUseCanvas = useCallback(() => {
    return isCanvasTexture(texture);
  }, [isCanvasTexture, texture]);

  return {
    // 状态
    texture,
    textureConfig,
    textureHistory,
    customPresets,
    
    // 操作方法
    selectTexture,
    updateTextureParameter,
    saveCurrentAsPreset,
    applyPreset,
    deletePreset,
    clearTextureHistory,
    
    // 查询方法
    isCanvasTexture,
    getTextureDisplayName,
    shouldUseCanvas
  };
};

export default useTextureManagement;