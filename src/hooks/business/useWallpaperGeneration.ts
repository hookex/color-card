/**
 * 壁纸生成业务逻辑Hook
 * 封装壁纸生成、保存和分享相关的业务逻辑
 * 
 * @description 负责处理：
 * - 壁纸截图生成
 * - 文件保存和下载
 * - 分享功能
 * - 渲染模式判断
 * - 错误处理
 */

import { useCallback, useState } from 'react';
import { useAppStoreSelectors } from '../../stores/useAppStore';
import { StorageService } from '../../services/storage';
import { PlatformService, HapticFeedbackType } from '../../services/platform';
import { takeScreenshot } from '../../utils/screenshot';
import createLogger from '../../utils/logger';

const logger = createLogger('useWallpaperGeneration');

/**
 * 保存结果类型
 */
export interface SaveResult {
  success: boolean;
  fileName?: string;
  path?: string;
  error?: string;
}

/**
 * 壁纸生成Hook接口
 */
export interface UseWallpaperGenerationReturn {
  // 状态
  isSaving: boolean;
  lastSaveResult: SaveResult | null;
  
  // 操作方法
  generateWallpaper: () => Promise<SaveResult>;
  saveToDevice: () => Promise<SaveResult>;
  shareWallpaper: () => Promise<void>;
  
  // 工具方法
  shouldUseCanvas: () => boolean;
  getWallpaperFormat: () => 'png' | 'jpg';
  getWallpaperQuality: () => number;
}

/**
 * 壁纸生成业务逻辑Hook
 */
export const useWallpaperGeneration = (): UseWallpaperGenerationReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveResult, setLastSaveResult] = useState<SaveResult | null>(null);
  
  // 状态选择器
  const texture = useAppStoreSelectors.useTexture();
  const color = useAppStoreSelectors.useColor();
  const colorType = useAppStoreSelectors.useColorType();
  const isCanvasTexture = useAppStoreSelectors.useIsCanvasTexture();
  const isNativePlatform = useAppStoreSelectors.useIsNativePlatform();

  /**
   * 判断是否应该使用Canvas渲染
   */
  const shouldUseCanvas = useCallback(() => {
    return isCanvasTexture;
  }, [isCanvasTexture]);

  /**
   * 获取壁纸格式
   */
  const getWallpaperFormat = useCallback((): 'png' | 'jpg' => {
    // 对于有透明度的纹理使用PNG，其他使用JPG以减小文件大小
    return texture === 'glass' || texture === 'frosted' ? 'png' : 'jpg';
  }, [texture]);

  /**
   * 获取壁纸质量
   */
  const getWallpaperQuality = useCallback((): number => {
    // 根据设备性能调整质量
    const performanceLevel = PlatformService.getPerformanceLevel();
    
    if (performanceLevel >= 4) return 1.0; // 高端设备：最高质量
    if (performanceLevel >= 3) return 0.9; // 中高端设备：高质量
    if (performanceLevel >= 2) return 0.8; // 中端设备：中等质量
    return 0.7; // 低端设备：较低质量
  }, []);

  /**
   * 生成文件名
   */
  const generateFileName = useCallback((): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const format = getWallpaperFormat();
    return `colorcard-${colorType}-${color.replace('#', '')}-${texture}-${timestamp}.${format}`;
  }, [color, colorType, texture, getWallpaperFormat]);

  /**
   * 生成壁纸
   */
  const generateWallpaper = useCallback(async (): Promise<SaveResult> => {
    setIsSaving(true);
    
    try {
      logger.info('Starting wallpaper generation', {
        texture,
        color,
        colorType,
        useCanvas: shouldUseCanvas()
      });

      // 触发开始保存的触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);

      // 根据渲染模式选择截图方式
      const screenshotMode = shouldUseCanvas() ? 'canvas' : 'div';
      const result = await takeScreenshot(screenshotMode);

      if (result.success) {
        logger.info('Wallpaper generated successfully:', result.fileName);
        
        // 触发成功的触觉反馈
        await PlatformService.triggerHapticFeedback(HapticFeedbackType.Success);
        
        setLastSaveResult(result);
        return result;
      } else {
        logger.error('Failed to generate wallpaper:', result.error);
        
        // 触发错误的触觉反馈
        await PlatformService.triggerHapticFeedback(HapticFeedbackType.Error);
        
        const errorResult = {
          success: false,
          error: result.error || 'Unknown error occurred'
        };
        
        setLastSaveResult(errorResult);
        return errorResult;
      }
    } catch (error) {
      logger.error('Wallpaper generation failed:', error);
      
      // 触发错误的触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Error);
      
      const errorResult = {
        success: false,
        error: String(error)
      };
      
      setLastSaveResult(errorResult);
      return errorResult;
    } finally {
      setIsSaving(false);
    }
  }, [texture, color, colorType, shouldUseCanvas]);

  /**
   * 保存到设备
   */
  const saveToDevice = useCallback(async (): Promise<SaveResult> => {
    logger.info('Saving wallpaper to device');
    
    try {
      // 生成壁纸
      const result = await generateWallpaper();
      
      if (result.success) {
        // 保存到壁纸历史
        const historyItem = {
          fileName: result.fileName,
          color,
          texture,
          colorType,
          timestamp: Date.now(),
          path: result.path
        };
        
        await StorageService.setCache('wallpaperHistory', historyItem);
        
        logger.info('Wallpaper saved to device successfully');
        return result;
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to save wallpaper to device:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }, [generateWallpaper, color, texture, colorType]);

  /**
   * 分享壁纸
   */
  const shareWallpaper = useCallback(async (): Promise<void> => {
    if (!isNativePlatform) {
      logger.warn('Share functionality not available on web platform');
      return;
    }

    try {
      logger.info('Sharing wallpaper');
      
      // 触发分享的触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);
      
      // 生成壁纸
      const result = await generateWallpaper();
      
      if (result.success && result.path) {
        // 这里可以集成原生分享功能
        // 由于Capacitor的Share插件需要额外配置，这里先记录日志
        logger.info('Wallpaper ready for sharing:', result.path);
        
        // 触发成功的触觉反馈
        await PlatformService.triggerHapticFeedback(HapticFeedbackType.Success);
      } else {
        logger.error('Failed to generate wallpaper for sharing');
        
        // 触发错误的触觉反馈
        await PlatformService.triggerHapticFeedback(HapticFeedbackType.Error);
      }
    } catch (error) {
      logger.error('Failed to share wallpaper:', error);
      
      // 触发错误的触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Error);
    }
  }, [isNativePlatform, generateWallpaper]);

  return {
    // 状态
    isSaving,
    lastSaveResult,
    
    // 操作方法
    generateWallpaper,
    saveToDevice,
    shareWallpaper,
    
    // 工具方法
    shouldUseCanvas,
    getWallpaperFormat,
    getWallpaperQuality
  };
};

export default useWallpaperGeneration;