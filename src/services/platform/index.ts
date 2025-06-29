/**
 * 平台服务模块导出入口
 * 统一导出所有平台相关的服务和工具
 */

export { default as PlatformService, PlatformType, DeviceType, HapticFeedbackType } from './platformService';
export type { DeviceCapabilities, NetworkStatus } from './platformService';