/**
 * 深度链接服务
 * 处理应用的深度链接和URL方案
 */

import { App } from '@capacitor/app';
import createLogger from '../../utils/logger';
import { capacitorService } from './capacitorService';

const logger = createLogger('DeepLinkService');

export interface DeepLinkHandler {
  pattern: string | RegExp;
  handler: (params: DeepLinkParams) => void | Promise<void>;
}

export interface DeepLinkParams {
  url: string;
  hostname?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  params?: Record<string, string>;
}

class DeepLinkService {
  private handlers: DeepLinkHandler[] = [];
  private isInitialized = false;

  /**
   * 初始化深度链接服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      logger.info('初始化深度链接服务');
      
      if (capacitorService.isNative()) {
        // 监听应用启动的URL
        App.addListener('appUrlOpen', (data) => {
          logger.info('收到深度链接', data);
          this.handleDeepLink(data.url);
        });
        
        // 检查应用启动时是否有URL
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
          logger.info('应用启动时的URL', launchUrl);
          this.handleDeepLink(launchUrl.url);
        }
      } else {
        // Web环境：监听URL变化
        this.setupWebDeepLink();
      }
      
      // 注册默认的深度链接处理器
      this.registerDefaultHandlers();
      
      this.isInitialized = true;
      logger.info('深度链接服务初始化完成');
      
    } catch (error) {
      logger.error('深度链接服务初始化失败', error);
      throw error;
    }
  }

  /**
   * 设置Web环境的深度链接
   */
  private setupWebDeepLink(): void {
    // 监听popstate事件
    window.addEventListener('popstate', () => {
      this.handleDeepLink(window.location.href);
    });
    
    // 检查当前URL
    if (window.location.search || window.location.hash) {
      this.handleDeepLink(window.location.href);
    }
  }

  /**
   * 注册默认的深度链接处理器
   */
  private registerDefaultHandlers(): void {
    // 颜色分享链接
    this.registerHandler({
      pattern: /^.*\/color\/(.+)$/,
      handler: (params) => this.handleColorShare(params)
    });
    
    // 壁纸分享链接
    this.registerHandler({
      pattern: /^.*\/wallpaper\/(.+)$/,
      handler: (params) => this.handleWallpaperShare(params)
    });
    
    // 纹理分享链接
    this.registerHandler({
      pattern: /^.*\/texture\/(.+)$/,
      handler: (params) => this.handleTextureShare(params)
    });
    
    // 配置分享链接
    this.registerHandler({
      pattern: /^.*\/config$/,
      handler: (params) => this.handleConfigShare(params)
    });
  }

  /**
   * 注册深度链接处理器
   */
  registerHandler(handler: DeepLinkHandler): void {
    this.handlers.push(handler);
    logger.info('注册深度链接处理器', { pattern: handler.pattern.toString() });
  }

  /**
   * 移除深度链接处理器
   */
  removeHandler(handler: DeepLinkHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
      logger.info('移除深度链接处理器', { pattern: handler.pattern.toString() });
    }
  }

  /**
   * 处理深度链接
   */
  private async handleDeepLink(url: string): Promise<void> {
    try {
      logger.info('处理深度链接', { url });
      
      const params = this.parseUrl(url);
      
      for (const handler of this.handlers) {
        if (this.matchPattern(url, handler.pattern)) {
          logger.info('匹配到处理器', { pattern: handler.pattern.toString(), url });
          await handler.handler(params);
          return;
        }
      }
      
      logger.warn('没有找到匹配的深度链接处理器', { url });
      
    } catch (error) {
      logger.error('处理深度链接失败', { url, error });
    }
  }

  /**
   * 解析URL
   */
  private parseUrl(url: string): DeepLinkParams {
    try {
      const urlObj = new URL(url);
      
      // 解析查询参数
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return {
        url,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        params
      };
      
    } catch (error) {
      logger.error('URL解析失败', { url, error });
      return { url };
    }
  }

  /**
   * 匹配模式
   */
  private matchPattern(url: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return url.includes(pattern);
    } else {
      return pattern.test(url);
    }
  }

  /**
   * 处理颜色分享
   */
  private async handleColorShare(params: DeepLinkParams): Promise<void> {
    try {
      const colorMatch = params.url.match(/\/color\/(.+)$/);
      if (!colorMatch) return;
      
      const colorCode = decodeURIComponent(colorMatch[1]);
      logger.info('处理颜色分享', { colorCode });
      
      // 验证颜色代码格式
      if (!/^#[0-9A-Fa-f]{6}$/.test(colorCode)) {
        logger.warn('无效的颜色代码', { colorCode });
        return;
      }
      
      // 应用颜色（这里需要与应用状态管理集成）
      this.applyColor(colorCode);
      
      // 显示通知
      this.showDeepLinkNotification('已应用分享的颜色');
      
    } catch (error) {
      logger.error('处理颜色分享失败', error);
    }
  }

  /**
   * 处理壁纸分享
   */
  private async handleWallpaperShare(params: DeepLinkParams): Promise<void> {
    try {
      const wallpaperMatch = params.url.match(/\/wallpaper\/(.+)$/);
      if (!wallpaperMatch) return;
      
      const wallpaperConfig = decodeURIComponent(wallpaperMatch[1]);
      logger.info('处理壁纸分享', { wallpaperConfig });
      
      try {
        const config = JSON.parse(wallpaperConfig);
        this.applyWallpaperConfig(config);
        this.showDeepLinkNotification('已应用分享的壁纸配置');
      } catch (parseError) {
        logger.error('壁纸配置解析失败', parseError);
      }
      
    } catch (error) {
      logger.error('处理壁纸分享失败', error);
    }
  }

  /**
   * 处理纹理分享
   */
  private async handleTextureShare(params: DeepLinkParams): Promise<void> {
    try {
      const textureMatch = params.url.match(/\/texture\/(.+)$/);
      if (!textureMatch) return;
      
      const textureType = decodeURIComponent(textureMatch[1]);
      logger.info('处理纹理分享', { textureType });
      
      // 验证纹理类型
      const validTextures = ['solid', 'linear', 'glow', 'leather', 'paint', 'frosted'];
      if (!validTextures.includes(textureType)) {
        logger.warn('无效的纹理类型', { textureType });
        return;
      }
      
      this.applyTexture(textureType);
      this.showDeepLinkNotification('已应用分享的纹理');
      
    } catch (error) {
      logger.error('处理纹理分享失败', error);
    }
  }

  /**
   * 处理配置分享
   */
  private async handleConfigShare(params: DeepLinkParams): Promise<void> {
    try {
      logger.info('处理配置分享', params);
      
      const { color, texture, colorType } = params.params || {};
      
      if (color) {
        this.applyColor(color);
      }
      
      if (texture) {
        this.applyTexture(texture);
      }
      
      if (colorType) {
        this.applyColorType(colorType);
      }
      
      this.showDeepLinkNotification('已应用分享的配置');
      
    } catch (error) {
      logger.error('处理配置分享失败', error);
    }
  }

  /**
   * 应用颜色（需要与状态管理集成）
   */
  private applyColor(colorCode: string): void {
    // TODO: 与Zustand状态管理集成
    logger.info('应用颜色', { colorCode });
    
    // 发送自定义事件
    window.dispatchEvent(new CustomEvent('deeplink:color', {
      detail: { color: colorCode }
    }));
  }

  /**
   * 应用纹理
   */
  private applyTexture(textureType: string): void {
    logger.info('应用纹理', { textureType });
    
    window.dispatchEvent(new CustomEvent('deeplink:texture', {
      detail: { texture: textureType }
    }));
  }

  /**
   * 应用颜色类型
   */
  private applyColorType(colorType: string): void {
    logger.info('应用颜色类型', { colorType });
    
    window.dispatchEvent(new CustomEvent('deeplink:colorType', {
      detail: { colorType }
    }));
  }

  /**
   * 应用壁纸配置
   */
  private applyWallpaperConfig(config: any): void {
    logger.info('应用壁纸配置', { config });
    
    window.dispatchEvent(new CustomEvent('deeplink:wallpaperConfig', {
      detail: { config }
    }));
  }

  /**
   * 显示深度链接通知
   */
  private showDeepLinkNotification(message: string): void {
    // 使用触觉反馈
    capacitorService.hapticFeedback();
    
    // 发送通知事件
    window.dispatchEvent(new CustomEvent('deeplink:notification', {
      detail: { message }
    }));
  }

  /**
   * 生成分享链接
   */
  generateShareUrl(type: 'color' | 'texture' | 'wallpaper' | 'config', data: any): string {
    const baseUrl = capacitorService.isNative() 
      ? 'colorcard://share' 
      : window.location.origin;
    
    switch (type) {
      case 'color':
        return `${baseUrl}/color/${encodeURIComponent(data.color)}`;
        
      case 'texture':
        return `${baseUrl}/texture/${encodeURIComponent(data.texture)}`;
        
      case 'wallpaper':
        return `${baseUrl}/wallpaper/${encodeURIComponent(JSON.stringify(data))}`;
        
      case 'config':
        const params = new URLSearchParams(data);
        return `${baseUrl}/config?${params.toString()}`;
        
      default:
        return baseUrl;
    }
  }

  /**
   * 分享当前配置
   */
  async shareCurrentConfig(config: {
    color?: string;
    texture?: string;
    colorType?: string;
  }): Promise<void> {
    try {
      const shareUrl = this.generateShareUrl('config', config);
      
      await capacitorService.share({
        title: 'ColorCard 配置分享',
        text: '查看我在 ColorCard 中创建的精美配置！',
        url: shareUrl,
        dialogTitle: '分享配置'
      });
      
      logger.info('配置分享成功', { config, shareUrl });
      
    } catch (error) {
      logger.error('配置分享失败', error);
      throw error;
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      this.handlers.length = 0;
      
      if (capacitorService.isNative()) {
        App.removeAllListeners();
      }
      
      this.isInitialized = false;
      logger.info('深度链接服务清理完成');
      
    } catch (error) {
      logger.error('深度链接服务清理失败', error);
    }
  }
}

// 单例实例
export const deepLinkService = new DeepLinkService();

export default deepLinkService;