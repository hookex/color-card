/**
 * 业务逻辑Hooks统一导出入口
 * 提供所有业务相关Hooks的集中访问点
 */

export { useColorSelection } from './useColorSelection';
export type { UseColorSelectionReturn } from './useColorSelection';

export { useTextureManagement } from './useTextureManagement';
export type { UseTextureManagementReturn } from './useTextureManagement';

export { useWallpaperGeneration } from './useWallpaperGeneration';
export type { UseWallpaperGenerationReturn, SaveResult } from './useWallpaperGeneration';