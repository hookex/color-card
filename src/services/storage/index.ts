/**
 * 存储服务模块导出入口
 * 统一导出所有存储相关的服务和工具
 */

export { default as StorageService, STORAGE_KEYS } from './storageService';
export type { UserPreferences, AppState, SaveResult } from './storageService';