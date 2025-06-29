/**
 * 存储服务层 - 统一管理所有数据持久化操作
 * 基于 Capacitor Storage API 和 Web Storage API 提供跨平台存储解决方案
 * 
 * @description 负责处理应用中所有的数据存储逻辑，包括：
 * - 用户偏好设置存储
 * - 应用状态持久化
 * - 文件系统操作
 * - 缓存管理
 */

import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { TextureType } from '../../types';
import createLogger from '../../utils/logger';

const logger = createLogger('StorageService');

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  // 用户偏好设置
  COLOR: 'user_selected_color',
  TEXTURE: 'user_selected_texture',
  COLOR_TYPE: 'user_selected_color_type',
  MODE: 'user_selected_mode',
  DEBUG: 'debug_mode',
  HIDE_COLOR_CARD: 'hide_color_card',
  
  // 应用状态
  APP_VERSION: 'app_version',
  FIRST_LAUNCH: 'first_launch',
  LAST_USED: 'last_used_timestamp',
  
  // 缓存和临时数据
  CACHE_PREFIX: 'cache_',
  TEMP_PREFIX: 'temp_',
  
  // 文件相关
  WALLPAPER_HISTORY: 'wallpaper_history',
  SAVED_SCREENSHOTS: 'saved_screenshots'
} as const;

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  color?: string;
  texture?: TextureType;
  colorType?: string;
  mode?: string;
  debug?: boolean;
  hideColorCard?: boolean;
}

/**
 * 应用状态接口
 */
export interface AppState {
  version?: string;
  firstLaunch?: boolean;
  lastUsed?: number;
}

/**
 * 文件保存结果接口
 */
export interface SaveResult {
  success: boolean;
  fileName?: string;
  path?: string;
  error?: string;
}

/**
 * 存储服务类
 * 提供统一的数据存储接口
 */
export class StorageService {
  /**
   * 检查存储是否可用
   * @returns 存储可用性状态
   */
  static async isStorageAvailable(): Promise<boolean> {
    try {
      const testKey = 'storage_test';
      const testValue = 'test';
      
      await Preferences.set({ key: testKey, value: testValue });
      const result = await Preferences.get({ key: testKey });
      await Preferences.remove({ key: testKey });
      
      return result.value === testValue;
    } catch (error) {
      logger.error('Storage availability check failed:', error);
      return false;
    }
  }

  /**
   * 保存用户偏好设置
   * @param preferences 用户偏好设置对象
   */
  static async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      if (preferences.color !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.COLOR, value: preferences.color })
        );
      }

      if (preferences.texture !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.TEXTURE, value: preferences.texture })
        );
      }

      if (preferences.colorType !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.COLOR_TYPE, value: preferences.colorType })
        );
      }

      if (preferences.mode !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.MODE, value: preferences.mode })
        );
      }

      if (preferences.debug !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.DEBUG, value: String(preferences.debug) })
        );
      }

      if (preferences.hideColorCard !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.HIDE_COLOR_CARD, value: String(preferences.hideColorCard) })
        );
      }

      await Promise.all(promises);
      logger.info('User preferences saved successfully');
    } catch (error) {
      logger.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  /**
   * 加载用户偏好设置
   * @returns 用户偏好设置对象
   */
  static async loadUserPreferences(): Promise<UserPreferences> {
    try {
      const keys = [
        STORAGE_KEYS.COLOR,
        STORAGE_KEYS.TEXTURE,
        STORAGE_KEYS.COLOR_TYPE,
        STORAGE_KEYS.MODE,
        STORAGE_KEYS.DEBUG,
        STORAGE_KEYS.HIDE_COLOR_CARD
      ];

      const results = await Promise.all(
        keys.map(key => Preferences.get({ key }))
      );

      const preferences: UserPreferences = {};

      if (results[0].value) preferences.color = results[0].value;
      if (results[1].value) preferences.texture = results[1].value as TextureType;
      if (results[2].value) preferences.colorType = results[2].value;
      if (results[3].value) preferences.mode = results[3].value;
      if (results[4].value) preferences.debug = results[4].value === 'true';
      if (results[5].value) preferences.hideColorCard = results[5].value === 'true';

      logger.info('User preferences loaded successfully');
      return preferences;
    } catch (error) {
      logger.error('Failed to load user preferences:', error);
      return {};
    }
  }

  /**
   * 清除用户偏好设置
   */
  static async clearUserPreferences(): Promise<void> {
    try {
      const keys = [
        STORAGE_KEYS.COLOR,
        STORAGE_KEYS.TEXTURE,
        STORAGE_KEYS.COLOR_TYPE,
        STORAGE_KEYS.MODE,
        STORAGE_KEYS.DEBUG,
        STORAGE_KEYS.HIDE_COLOR_CARD
      ];

      await Promise.all(
        keys.map(key => Preferences.remove({ key }))
      );

      logger.info('User preferences cleared successfully');
    } catch (error) {
      logger.error('Failed to clear user preferences:', error);
      throw error;
    }
  }

  /**
   * 保存应用状态
   * @param state 应用状态对象
   */
  static async saveAppState(state: AppState): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      if (state.version !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.APP_VERSION, value: state.version })
        );
      }

      if (state.firstLaunch !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.FIRST_LAUNCH, value: String(state.firstLaunch) })
        );
      }

      if (state.lastUsed !== undefined) {
        promises.push(
          Preferences.set({ key: STORAGE_KEYS.LAST_USED, value: String(state.lastUsed) })
        );
      }

      await Promise.all(promises);
      logger.info('App state saved successfully');
    } catch (error) {
      logger.error('Failed to save app state:', error);
      throw error;
    }
  }

  /**
   * 加载应用状态
   * @returns 应用状态对象
   */
  static async loadAppState(): Promise<AppState> {
    try {
      const keys = [
        STORAGE_KEYS.APP_VERSION,
        STORAGE_KEYS.FIRST_LAUNCH,
        STORAGE_KEYS.LAST_USED
      ];

      const results = await Promise.all(
        keys.map(key => Preferences.get({ key }))
      );

      const state: AppState = {};

      if (results[0].value) state.version = results[0].value;
      if (results[1].value) state.firstLaunch = results[1].value === 'true';
      if (results[2].value) state.lastUsed = parseInt(results[2].value, 10);

      logger.info('App state loaded successfully');
      return state;
    } catch (error) {
      logger.error('Failed to load app state:', error);
      return {};
    }
  }

  /**
   * 保存文件到设备存储
   * @param data 文件数据（Base64或Blob）
   * @param fileName 文件名
   * @param directory 保存目录
   * @returns 保存结果
   */
  static async saveFile(
    data: string, 
    fileName: string, 
    directory: Directory = Directory.Documents
  ): Promise<SaveResult> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Web平台处理
        return this.saveFileWeb(data, fileName);
      }

      // 移动平台处理
      const result = await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: directory,
        encoding: Encoding.UTF8
      });

      logger.info('File saved successfully:', result.uri);
      return {
        success: true,
        fileName: fileName,
        path: result.uri
      };
    } catch (error) {
      logger.error('Failed to save file:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Web平台文件保存处理
   * @param data 文件数据
   * @param fileName 文件名
   * @returns 保存结果
   */
  private static saveFileWeb(data: string, fileName: string): SaveResult {
    try {
      // 创建下载链接
      const link = document.createElement('a');
      link.href = data.startsWith('data:') ? data : `data:image/png;base64,${data}`;
      link.download = fileName;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        success: true,
        fileName: fileName
      };
    } catch (error) {
      logger.error('Web file save failed:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * 读取文件
   * @param fileName 文件名
   * @param directory 文件目录
   * @returns 文件内容
   */
  static async readFile(
    fileName: string, 
    directory: Directory = Directory.Documents
  ): Promise<string | null> {
    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory: directory,
        encoding: Encoding.UTF8
      });

      return result.data as string;
    } catch (error) {
      logger.error('Failed to read file:', error);
      return null;
    }
  }

  /**
   * 删除文件
   * @param fileName 文件名
   * @param directory 文件目录
   */
  static async deleteFile(
    fileName: string, 
    directory: Directory = Directory.Documents
  ): Promise<boolean> {
    try {
      await Filesystem.deleteFile({
        path: fileName,
        directory: directory
      });

      logger.info('File deleted successfully:', fileName);
      return true;
    } catch (error) {
      logger.error('Failed to delete file:', error);
      return false;
    }
  }

  /**
   * 缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 缓存过期时间（毫秒）
   */
  static async setCache(key: string, data: any, ttl?: number): Promise<void> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${key}`;
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        ttl: ttl
      };

      await Preferences.set({
        key: cacheKey,
        value: JSON.stringify(cacheData)
      });

      logger.info('Cache set successfully:', key);
    } catch (error) {
      logger.error('Failed to set cache:', error);
      throw error;
    }
  }

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  static async getCache<T = any>(key: string): Promise<T | null> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${key}`;
      const result = await Preferences.get({ key: cacheKey });

      if (!result.value) {
        return null;
      }

      const cacheData = JSON.parse(result.value);
      const now = Date.now();

      // 检查缓存是否过期
      if (cacheData.ttl && (now - cacheData.timestamp) > cacheData.ttl) {
        await this.removeCache(key);
        return null;
      }

      return cacheData.data as T;
    } catch (error) {
      logger.error('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * 移除缓存
   * @param key 缓存键
   */
  static async removeCache(key: string): Promise<void> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${key}`;
      await Preferences.remove({ key: cacheKey });
      logger.info('Cache removed successfully:', key);
    } catch (error) {
      logger.error('Failed to remove cache:', error);
    }
  }

  /**
   * 清除所有缓存
   */
  static async clearAllCache(): Promise<void> {
    try {
      const keys = await Preferences.keys();
      const cacheKeys = keys.keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
      
      await Promise.all(cacheKeys.map(key => Preferences.remove({ key })));
      logger.info('All cache cleared successfully');
    } catch (error) {
      logger.error('Failed to clear all cache:', error);
    }
  }

  /**
   * 获取存储统计信息
   * @returns 存储使用情况
   */
  static async getStorageStats(): Promise<{
    totalKeys: number;
    cacheKeys: number;
    preferenceKeys: number;
    tempKeys: number;
  }> {
    try {
      const keys = await Preferences.keys();
      const allKeys = keys.keys;
      
      const cacheKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
      const tempKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.TEMP_PREFIX));
      const preferenceKeys = allKeys.filter(key => 
        !key.startsWith(STORAGE_KEYS.CACHE_PREFIX) && 
        !key.startsWith(STORAGE_KEYS.TEMP_PREFIX)
      );

      return {
        totalKeys: allKeys.length,
        cacheKeys: cacheKeys.length,
        preferenceKeys: preferenceKeys.length,
        tempKeys: tempKeys.length
      };
    } catch (error) {
      logger.error('Failed to get storage stats:', error);
      return {
        totalKeys: 0,
        cacheKeys: 0,
        preferenceKeys: 0,
        tempKeys: 0
      };
    }
  }
}

export default StorageService;