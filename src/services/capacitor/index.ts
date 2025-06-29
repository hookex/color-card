/**
 * Capacitor 服务模块
 * 导出 Capacitor 相关的所有服务和类型
 */

export { 
  capacitorService,
  type PlatformInfo,
  type HapticsOptions,
  type ShareOptions,
  type FileOptions,
  type PhotoOptions
} from './capacitorService';

// 壁纸服务暂时注释，需要时再实现
// export { 
//   wallpaperService,
//   type WallpaperOptions,
//   type SaveResult
// } from './wallpaperService';

// 深度链接服务暂时注释，需要时再实现
// export {
//   deepLinkService,
//   type DeepLinkHandler
// } from './deepLinkService';

export { performanceOptimizer } from './performanceOptimizer';