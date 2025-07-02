/**
 * 颜色卡片基础接口
 * 表示应用中的颜色数据结构
 */
export interface ColorCard {
  /** 十六进制颜色值 */
  color: string;
  /** 英文名称（可选） */
  name?: string;
  /** 中文名称 */
  zhName: string;
  /** 拼音名称（可选） */
  pinyin?: string;
  /** RGB颜色值（可选） */
  rgb?: string;
  /** CMYK颜色值（可选） */
  cmyk?: string;
  /** 颜色描述 */
  description: string;
  /** 年份（可选） */
  year?: number;
}

/**
 * 完整颜色信息接口
 * 包含所有必需的颜色属性
 */
export interface ColorInfo {
  /** 十六进制颜色值 */
  color: string;
  /** 英文名称 */
  name: string;
  /** 中文名称 */
  zhName: string;
  /** 拼音名称 */
  pinyin: string;
  /** RGB颜色值 */
  rgb: string;
  /** CMYK颜色值 */
  cmyk: string;
  /** 颜色描述 */
  description: string;
  /** 年份 */
  year: number;
}

/**
 * 纹理类型枚举
 * 定义可用的材质纹理类型
 */
export type TextureType = 'solid' | 'leather' | 'paint' | 'glass' | 'linear' | 'glow' | 'frosted';

/**
 * 颜色类型分类
 * 定义颜色的分类标准
 */
export type ColorType = 'brand' | 'chinese' | 'nature' | 'food' | 'mood' | 'space';

/**
 * 页面转场方向
 * 定义页面切换动画的方向
 */
export type TransitionDirection = 'left' | 'right' | 'up' | 'down';


/**
 * 语言类型
 * 定义支持的语言选项
 */
export type Language = 'zh' | 'en';

/**
 * 设备平台类型
 * 定义运行平台
 */
export type Platform = 'web' | 'ios' | 'android';

/**
 * 图片格式类型
 * 定义支持的导出图片格式
 */
export type ImageFormat = 'png' | 'jpg' | 'webp';

/**
 * 图片质量设置
 * 定义图片导出质量选项
 */
export type ImageQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * 错误类型分类
 * 定义应用中的错误类别
 */
export type ErrorType = 'network' | 'render' | 'permission' | 'unknown';

/**
 * 用户偏好设置接口
 * 存储用户的个性化配置
 */
export interface UserPreferences {
  /** 语言设置 */
  language: Language;
  /** 默认纹理类型 */
  defaultTexture: TextureType;
  /** 默认图片质量 */
  defaultImageQuality: ImageQuality;
  /** 是否启用触觉反馈 */
  enableHapticFeedback: boolean;
  /** 是否启用动画 */
  enableAnimations: boolean;
  /** 颜色历史记录 */
  colorHistory: string[];
}

/**
 * 应用状态接口
 * 定义应用运行时的状态
 */
export interface AppState {
  /** 当前选中的颜色 */
  selectedColor: string;
  /** 当前纹理类型 */
  currentTexture: TextureType;
  /** 当前颜色类型过滤 */
  currentColorType: ColorType;
  /** 是否显示加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已初始化 */
  isInitialized: boolean;
}

/**
 * 导出配置接口
 * 定义图片导出的参数
 */
export interface ExportConfig {
  /** 图片格式 */
  format: ImageFormat;
  /** 图片质量 */
  quality: ImageQuality;
  /** 图片宽度 */
  width: number;
  /** 图片高度 */
  height: number;
  /** 是否包含水印 */
  includeWatermark: boolean;
  /** 文件名前缀 */
  fileNamePrefix: string;
}
