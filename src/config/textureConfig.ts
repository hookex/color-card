import { TextureType } from '../components/TextureTools';

export type RenderMode = 'div' | 'canvas';

interface TextureConfig {
  renderMode: RenderMode;
  enabled: boolean;  // 添加启用状态控制
}

export const textureConfigs: Record<TextureType, TextureConfig> = {
  solid: {
    renderMode: 'div',
    enabled: true
  },
  linear: {
    renderMode: 'div',
    enabled: true
  },
  leather: {
    renderMode: 'canvas',
    enabled: false  // 暂时禁用
  },
  glass: {
    renderMode: 'div',
    enabled: true  // 启用毛玻璃效果
  },
  paint: {
    renderMode: 'canvas',
    enabled: true
  },
  glow: {
    renderMode: 'canvas',
    enabled: false  // 暂时禁用
  },
  frosted: {
    renderMode: 'div',
    enabled: true  // 启用磨砂玻璃效果
  }
};

// 获取启用的材质类型列表
export const getEnabledTextures = (): TextureType[] => {
  return Object.entries(textureConfigs)
    .filter(([_, config]) => config.enabled)
    .map(([type]) => type as TextureType);
};
