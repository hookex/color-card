/**
 * Capacitor 平台服务
 * 提供跨平台的原生功能抽象
 */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App, AppState } from '@capacitor/app';
import { Device, DeviceInfo } from '@capacitor/device';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import createLogger from '../../utils/logger';

const logger = createLogger('CapacitorService');

export interface PlatformInfo {
  platform: 'ios' | 'android' | 'web';
  isNative: boolean;
  isHybrid: boolean;
  deviceInfo?: DeviceInfo;
  networkStatus?: ConnectionStatus;
}

export interface HapticsOptions {
  style?: ImpactStyle;
  notification?: NotificationType;
}

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

export interface FileOptions {
  path: string;
  directory?: Directory;
  data?: string;
  encoding?: 'utf8' | 'base64';
}

export interface PhotoOptions {
  resultType?: CameraResultType;
  source?: CameraSource;
  quality?: number;
  allowEditing?: boolean;
  width?: number;
  height?: number;
}

class CapacitorService {
  private platformInfo: PlatformInfo | null = null;
  private appStateListeners: ((state: AppState) => void)[] = [];
  private networkListeners: ((status: ConnectionStatus) => void)[] = [];
  private keyboardListeners: ((info: { keyboardHeight: number }) => void)[] = [];

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      logger.info('初始化 Capacitor 服务');
      
      // 获取平台信息
      await this.detectPlatform();
      
      // 设置状态栏
      await this.setupStatusBar();
      
      // 设置键盘
      await this.setupKeyboard();
      
      // 设置应用生命周期监听
      await this.setupAppListeners();
      
      // 设置网络监听
      await this.setupNetworkListeners();
      
      logger.info('Capacitor 服务初始化完成', this.platformInfo);
    } catch (error) {
      logger.error('Capacitor 服务初始化失败', error);
      throw error;
    }
  }

  /**
   * 检测平台信息
   */
  private async detectPlatform(): Promise<void> {
    const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
    const isNative = Capacitor.isNativePlatform();
    const isHybrid = Capacitor.isPluginAvailable('Device');
    
    let deviceInfo: DeviceInfo | undefined;
    let networkStatus: ConnectionStatus | undefined;
    
    if (isHybrid) {
      try {
        deviceInfo = await Device.getInfo();
        networkStatus = await Network.getStatus();
      } catch (error) {
        logger.warn('获取设备信息失败', error);
      }
    }
    
    this.platformInfo = {
      platform,
      isNative,
      isHybrid,
      deviceInfo,
      networkStatus
    };
  }

  /**
   * 设置状态栏
   */
  private async setupStatusBar(): Promise<void> {
    if (!this.platformInfo?.isNative) return;
    
    try {
      await StatusBar.setStyle({ style: StatusBarStyle.Dark });
      
      if (this.platformInfo.platform === 'android') {
        await StatusBar.setBackgroundColor({ color: '#000000' });
      }
      
      await StatusBar.setOverlaysWebView({ overlay: false });
      
      logger.info('状态栏配置完成');
    } catch (error) {
      logger.warn('状态栏配置失败', error);
    }
  }

  /**
   * 设置键盘
   */
  private async setupKeyboard(): Promise<void> {
    if (!this.platformInfo?.isNative) return;
    
    try {
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      
      // 监听键盘事件
      Keyboard.addListener('keyboardWillShow', (info) => {
        this.keyboardListeners.forEach(listener => listener(info));
      });
      
      Keyboard.addListener('keyboardWillHide', () => {
        this.keyboardListeners.forEach(listener => listener({ keyboardHeight: 0 }));
      });
      
      logger.info('键盘配置完成');
    } catch (error) {
      logger.warn('键盘配置失败', error);
    }
  }

  /**
   * 设置应用生命周期监听
   */
  private async setupAppListeners(): Promise<void> {
    if (!this.platformInfo?.isNative) return;
    
    try {
      App.addListener('appStateChange', (state) => {
        logger.info('应用状态变化', state);
        this.appStateListeners.forEach(listener => listener(state));
      });
      
      App.addListener('backButton', () => {
        logger.info('返回按钮被按下');
        // 可以在这里处理自定义返回逻辑
      });
      
      logger.info('应用生命周期监听设置完成');
    } catch (error) {
      logger.warn('应用生命周期监听设置失败', error);
    }
  }

  /**
   * 设置网络监听
   */
  private async setupNetworkListeners(): Promise<void> {
    if (!this.platformInfo?.isHybrid) return;
    
    try {
      Network.addListener('networkStatusChange', (status) => {
        logger.info('网络状态变化', status);
        this.networkListeners.forEach(listener => listener(status));
      });
      
      logger.info('网络状态监听设置完成');
    } catch (error) {
      logger.warn('网络状态监听设置失败', error);
    }
  }

  /**
   * 获取平台信息
   */
  getPlatformInfo(): PlatformInfo | null {
    return this.platformInfo;
  }

  /**
   * 检查是否为原生平台
   */
  isNative(): boolean {
    return this.platformInfo?.isNative ?? false;
  }

  /**
   * 检查是否为混合应用
   */
  isHybrid(): boolean {
    return this.platformInfo?.isHybrid ?? false;
  }

  /**
   * 获取平台名称
   */
  getPlatform(): 'ios' | 'android' | 'web' {
    return this.platformInfo?.platform ?? 'web';
  }

  /**
   * 触觉反馈
   */
  async hapticFeedback(options: HapticsOptions = {}): Promise<void> {
    if (!this.isNative()) return;
    
    try {
      if (options.notification) {
        await Haptics.notification({ type: options.notification });
      } else {
        await Haptics.impact({ style: options.style ?? ImpactStyle.Light });
      }
    } catch (error) {
      logger.warn('触觉反馈失败', error);
    }
  }

  /**
   * 分享内容
   */
  async share(options: ShareOptions): Promise<void> {
    try {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle
      });
    } catch (error) {
      logger.error('分享失败', error);
      throw error;
    }
  }

  /**
   * 存储偏好设置
   */
  async setPreference(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      logger.error('存储偏好设置失败', error);
      throw error;
    }
  }

  /**
   * 获取偏好设置
   */
  async getPreference(key: string): Promise<string | null> {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      logger.error('获取偏好设置失败', error);
      return null;
    }
  }

  /**
   * 移除偏好设置
   */
  async removePreference(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      logger.error('移除偏好设置失败', error);
      throw error;
    }
  }

  /**
   * 清空所有偏好设置
   */
  async clearPreferences(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      logger.error('清空偏好设置失败', error);
      throw error;
    }
  }

  /**
   * 写入文件
   */
  async writeFile(options: FileOptions): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: options.path,
        data: options.data || '',
        directory: options.directory || Directory.Documents,
        encoding: (options.encoding || 'utf8') as any
      });
    } catch (error) {
      logger.error('写入文件失败', error);
      throw error;
    }
  }

  /**
   * 读取文件
   */
  async readFile(options: Omit<FileOptions, 'data'>): Promise<string> {
    try {
      const result = await Filesystem.readFile({
        path: options.path,
        directory: options.directory || Directory.Documents,
        encoding: (options.encoding || 'utf8') as any
      });
      return result.data as string;
    } catch (error) {
      logger.error('读取文件失败', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(options: Omit<FileOptions, 'data' | 'encoding'>): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: options.path,
        directory: options.directory || Directory.Documents
      });
    } catch (error) {
      logger.error('删除文件失败', error);
      throw error;
    }
  }

  /**
   * 拍照或选择图片
   */
  async getPhoto(options: PhotoOptions = {}): Promise<string> {
    try {
      const photo = await Camera.getPhoto({
        resultType: options.resultType || CameraResultType.Uri,
        source: options.source || CameraSource.Prompt,
        quality: options.quality || 90,
        allowEditing: options.allowEditing !== false,
        width: options.width,
        height: options.height
      });
      return photo.webPath || photo.dataUrl || '';
    } catch (error) {
      logger.error('获取照片失败', error);
      throw error;
    }
  }

  /**
   * 获取网络状态
   */
  async getNetworkStatus(): Promise<ConnectionStatus | null> {
    if (!this.isHybrid()) return null;
    
    try {
      return await Network.getStatus();
    } catch (error) {
      logger.error('获取网络状态失败', error);
      return null;
    }
  }

  /**
   * 获取设备信息
   */
  async getDeviceInfo(): Promise<DeviceInfo | null> {
    if (!this.isHybrid()) return null;
    
    try {
      return await Device.getInfo();
    } catch (error) {
      logger.error('获取设备信息失败', error);
      return null;
    }
  }

  /**
   * 隐藏键盘
   */
  async hideKeyboard(): Promise<void> {
    if (!this.isNative()) return;
    
    try {
      await Keyboard.hide();
    } catch (error) {
      logger.warn('隐藏键盘失败', error);
    }
  }

  /**
   * 添加应用状态监听器
   */
  addAppStateListener(listener: (state: AppState) => void): void {
    this.appStateListeners.push(listener);
  }

  /**
   * 移除应用状态监听器
   */
  removeAppStateListener(listener: (state: AppState) => void): void {
    const index = this.appStateListeners.indexOf(listener);
    if (index > -1) {
      this.appStateListeners.splice(index, 1);
    }
  }

  /**
   * 添加网络状态监听器
   */
  addNetworkListener(listener: (status: ConnectionStatus) => void): void {
    this.networkListeners.push(listener);
  }

  /**
   * 移除网络状态监听器
   */
  removeNetworkListener(listener: (status: ConnectionStatus) => void): void {
    const index = this.networkListeners.indexOf(listener);
    if (index > -1) {
      this.networkListeners.splice(index, 1);
    }
  }

  /**
   * 添加键盘监听器
   */
  addKeyboardListener(listener: (info: { keyboardHeight: number }) => void): void {
    this.keyboardListeners.push(listener);
  }

  /**
   * 移除键盘监听器
   */
  removeKeyboardListener(listener: (info: { keyboardHeight: number }) => void): void {
    const index = this.keyboardListeners.indexOf(listener);
    if (index > -1) {
      this.keyboardListeners.splice(index, 1);
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      // 清理监听器
      this.appStateListeners.length = 0;
      this.networkListeners.length = 0;
      this.keyboardListeners.length = 0;
      
      // 移除 Capacitor 监听器
      if (this.isNative()) {
        App.removeAllListeners();
        Keyboard.removeAllListeners();
      }
      
      if (this.isHybrid()) {
        Network.removeAllListeners();
      }
      
      logger.info('Capacitor 服务清理完成');
    } catch (error) {
      logger.error('Capacitor 服务清理失败', error);
    }
  }
}

// 单例实例
export const capacitorService = new CapacitorService();

export default capacitorService;