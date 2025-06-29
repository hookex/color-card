/**
 * 壁纸服务
 * 专门处理壁纸的生成、保存、分享等功能
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';
import createLogger from '../../utils/logger';
import { capacitorService } from './capacitorService';

const logger = createLogger('WallpaperService');

export interface WallpaperOptions {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  width?: number;
  height?: number;
  devicePixelRatio?: number;
  filename?: string;
  saveToGallery?: boolean;
  shareAfterSave?: boolean;
}

export interface SaveResult {
  success: boolean;
  fileName?: string;
  path?: string;
  error?: string;
  webPath?: string;
}

class WallpaperService {
  private readonly defaultOptions: Required<Omit<WallpaperOptions, 'filename' | 'shareAfterSave'>> = {
    format: 'png',
    quality: 1.0,
    width: window.screen.width * (window.devicePixelRatio || 1),
    height: window.screen.height * (window.devicePixelRatio || 1),
    devicePixelRatio: window.devicePixelRatio || 1,
    saveToGallery: true
  };

  /**
   * 从页面元素生成壁纸
   */
  async generateFromElement(
    element: HTMLElement,
    options: WallpaperOptions = {}
  ): Promise<SaveResult> {
    try {
      logger.info('开始生成壁纸', { options });

      const mergedOptions = { ...this.defaultOptions, ...options };
      
      // 使用 html2canvas 截图
      const canvas = await this.captureElement(element, mergedOptions);
      
      // 转换为数据URL
      const dataUrl = canvas.toDataURL(`image/${mergedOptions.format}`, mergedOptions.quality);
      
      // 生成文件名
      const filename = this.generateFilename(mergedOptions.format, options.filename);
      
      // 保存文件
      const saveResult = await this.saveWallpaper(dataUrl, filename, mergedOptions);
      
      // 分享（如果需要）
      if (options.shareAfterSave && saveResult.success) {
        await this.shareWallpaper(saveResult);
      }
      
      logger.info('壁纸生成完成', saveResult);
      return saveResult;
      
    } catch (error) {
      logger.error('壁纸生成失败', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 从Canvas生成壁纸
   */
  async generateFromCanvas(
    canvas: HTMLCanvasElement,
    options: WallpaperOptions = {}
  ): Promise<SaveResult> {
    try {
      logger.info('从Canvas生成壁纸', { options });

      const mergedOptions = { ...this.defaultOptions, ...options };
      
      // 调整Canvas尺寸（如果需要）
      const processedCanvas = await this.processCanvas(canvas, mergedOptions);
      
      // 转换为数据URL
      const dataUrl = processedCanvas.toDataURL(`image/${mergedOptions.format}`, mergedOptions.quality);
      
      // 生成文件名
      const filename = this.generateFilename(mergedOptions.format, options.filename);
      
      // 保存文件
      const saveResult = await this.saveWallpaper(dataUrl, filename, mergedOptions);
      
      // 分享（如果需要）
      if (options.shareAfterSave && saveResult.success) {
        await this.shareWallpaper(saveResult);
      }
      
      logger.info('Canvas壁纸生成完成', saveResult);
      return saveResult;
      
    } catch (error) {
      logger.error('Canvas壁纸生成失败', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 捕获页面元素
   */
  private async captureElement(
    element: HTMLElement,
    options: Required<Omit<WallpaperOptions, 'filename' | 'shareAfterSave'>>
  ): Promise<HTMLCanvasElement> {
    
    // 获取设备实际尺寸
    const deviceWidth = window.screen.width;
    const deviceHeight = window.screen.height;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    return html2canvas(element, {
      width: options.width || deviceWidth,
      height: options.height || deviceHeight,
      scale: devicePixelRatio,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      windowWidth: deviceWidth,
      windowHeight: deviceHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      // 优化性能
      removeContainer: true,
      foreignObjectRendering: false,
      // 处理字体
      onclone: (clonedDoc) => {
        // 确保字体正确加载
        const style = clonedDoc.createElement('style');
        style.textContent = `
          @font-face {
            font-family: 'AlimamaDongFangDaKai';
            src: url('/fonts/AlimamaDongFangDaKai-Regular.woff2') format('woff2');
          }
          @font-face {
            font-family: 'TsangerYuYang';
            src: url('/fonts/TsangerYuYangT_W03_W03.ttf') format('truetype');
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
  }

  /**
   * 处理Canvas（调整尺寸等）
   */
  private async processCanvas(
    canvas: HTMLCanvasElement,
    options: Required<Omit<WallpaperOptions, 'filename' | 'shareAfterSave'>>
  ): Promise<HTMLCanvasElement> {
    
    // 如果尺寸已经符合要求，直接返回
    if (canvas.width === options.width && canvas.height === options.height) {
      return canvas;
    }
    
    // 创建新的Canvas进行尺寸调整
    const newCanvas = document.createElement('canvas');
    const ctx = newCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }
    
    newCanvas.width = options.width;
    newCanvas.height = options.height;
    
    // 绘制原Canvas到新Canvas，自动缩放
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, options.width, options.height);
    
    return newCanvas;
  }

  /**
   * 保存壁纸文件
   */
  private async saveWallpaper(
    dataUrl: string,
    filename: string,
    options: Required<Omit<WallpaperOptions, 'filename' | 'shareAfterSave'>>
  ): Promise<SaveResult> {
    
    // 提取base64数据
    const base64Data = dataUrl.split(',')[1];
    
    if (capacitorService.isNative()) {
      // 原生平台：保存到文档目录
      return this.saveToNativePlatform(base64Data, filename);
    } else {
      // Web平台：触发下载
      return this.saveToWebPlatform(dataUrl, filename);
    }
  }

  /**
   * 保存到原生平台
   */
  private async saveToNativePlatform(base64Data: string, filename: string): Promise<SaveResult> {
    try {
      // 保存到文档目录
      const documentsPath = `wallpapers/${filename}`;
      
      await Filesystem.writeFile({
        path: documentsPath,
        data: base64Data,
        directory: Directory.Documents
      });

      // 获取文件URI
      const fileUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: documentsPath
      });

      logger.info('壁纸保存到原生平台成功', { filename, uri: fileUri.uri });

      return {
        success: true,
        fileName: filename,
        path: documentsPath,
        webPath: fileUri.uri
      };
      
    } catch (error) {
      logger.error('保存到原生平台失败', error);
      throw error;
    }
  }

  /**
   * 保存到Web平台
   */
  private async saveToWebPlatform(dataUrl: string, filename: string): Promise<SaveResult> {
    try {
      // 创建下载链接
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.style.display = 'none';
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      logger.info('壁纸保存到Web平台成功', { filename });
      
      return {
        success: true,
        fileName: filename,
        webPath: dataUrl
      };
      
    } catch (error) {
      logger.error('保存到Web平台失败', error);
      throw error;
    }
  }

  /**
   * 分享壁纸
   */
  private async shareWallpaper(saveResult: SaveResult): Promise<void> {
    if (!saveResult.success || !saveResult.webPath) {
      throw new Error('没有可分享的壁纸文件');
    }
    
    try {
      await Share.share({
        title: 'ColorCard 壁纸',
        text: '使用 ColorCard 生成的精美壁纸',
        url: saveResult.webPath,
        dialogTitle: '分享壁纸'
      });
      
      logger.info('壁纸分享成功');
      
    } catch (error) {
      logger.error('壁纸分享失败', error);
      throw error;
    }
  }

  /**
   * 生成文件名
   */
  private generateFilename(format: string, customName?: string): string {
    if (customName) {
      return customName.endsWith(`.${format}`) ? customName : `${customName}.${format}`;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `colorcard-wallpaper-${timestamp}.${format}`;
  }

  /**
   * 获取设备最佳壁纸尺寸
   */
  getOptimalWallpaperSize(): { width: number; height: number } {
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 获取屏幕真实尺寸
    let width = window.screen.width;
    let height = window.screen.height;
    
    // 考虑设备像素比
    width *= devicePixelRatio;
    height *= devicePixelRatio;
    
    // 确保是竖屏方向（壁纸通常是竖屏的）
    if (width > height) {
      [width, height] = [height, width];
    }
    
    // 对于高DPI设备，可能需要进一步优化
    const platform = capacitorService.getPlatform();
    
    if (platform === 'ios') {
      // iOS设备的常见尺寸优化
      const iosOptimization = this.getIOSOptimalSize(width, height);
      if (iosOptimization) {
        return iosOptimization;
      }
    } else if (platform === 'android') {
      // Android设备的常见尺寸优化
      const androidOptimization = this.getAndroidOptimalSize(width, height);
      if (androidOptimization) {
        return androidOptimization;
      }
    }
    
    return { width, height };
  }

  /**
   * iOS设备尺寸优化
   */
  private getIOSOptimalSize(width: number, height: number): { width: number; height: number } | null {
    // 常见的iOS设备尺寸映射
    const iosResolutions = [
      { width: 1170, height: 2532 }, // iPhone 12 Pro
      { width: 1125, height: 2436 }, // iPhone X/XS
      { width: 828, height: 1792 },  // iPhone XR
      { width: 750, height: 1334 },  // iPhone 8
      { width: 1242, height: 2688 }, // iPhone XS Max
      { width: 1284, height: 2778 }, // iPhone 12 Pro Max
      { width: 1080, height: 2340 }, // iPhone 12 mini
    ];
    
    // 找到最接近的标准尺寸
    let bestMatch = null;
    let minDifference = Infinity;
    
    for (const resolution of iosResolutions) {
      const difference = Math.abs(width - resolution.width) + Math.abs(height - resolution.height);
      if (difference < minDifference) {
        minDifference = difference;
        bestMatch = resolution;
      }
    }
    
    return bestMatch;
  }

  /**
   * Android设备尺寸优化
   */
  private getAndroidOptimalSize(width: number, height: number): { width: number; height: number } | null {
    // 常见的Android设备尺寸映射
    const androidResolutions = [
      { width: 1080, height: 2340 }, // 常见的FHD+
      { width: 1080, height: 1920 }, // 标准FHD
      { width: 1440, height: 2960 }, // QHD+
      { width: 1440, height: 2560 }, // 标准QHD
      { width: 720, height: 1280 },  // HD
      { width: 1080, height: 2400 }, // 20:9 FHD+
    ];
    
    // 找到最接近的标准尺寸
    let bestMatch = null;
    let minDifference = Infinity;
    
    for (const resolution of androidResolutions) {
      const difference = Math.abs(width - resolution.width) + Math.abs(height - resolution.height);
      if (difference < minDifference) {
        minDifference = difference;
        bestMatch = resolution;
      }
    }
    
    return bestMatch;
  }

  /**
   * 清理旧的壁纸文件
   */
  async cleanupOldWallpapers(keepCount: number = 5): Promise<void> {
    if (!capacitorService.isNative()) return;
    
    try {
      const wallpapersDir = 'wallpapers';
      
      // 列出所有壁纸文件
      const result = await Filesystem.readdir({
        path: wallpapersDir,
        directory: Directory.Documents
      });
      
      // 按修改时间排序（最新的在前）
      const files = result.files
        .filter(file => file.name.startsWith('colorcard-wallpaper-'))
        .sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
      
      // 删除旧文件
      const filesToDelete = files.slice(keepCount);
      
      for (const file of filesToDelete) {
        await Filesystem.deleteFile({
          path: `${wallpapersDir}/${file.name}`,
          directory: Directory.Documents
        });
      }
      
      if (filesToDelete.length > 0) {
        logger.info(`清理了 ${filesToDelete.length} 个旧壁纸文件`);
      }
      
    } catch (error) {
      logger.warn('清理旧壁纸文件失败', error);
    }
  }
}

// 单例实例
export const wallpaperService = new WallpaperService();

export default wallpaperService;