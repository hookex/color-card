import { TextureType } from '../components/TextureTools';

export type RenderMode = 'div' | 'canvas';

interface TextureConfig {
  type: TextureType;
  renderMode: RenderMode;
  enabled: boolean;  // 添加启用状态控制
}

export const textureConfigs: TextureConfig[] = [
  {
    type: 'solid',
    renderMode: 'div',
    enabled: true
  },
  {
    type: 'linear',
    renderMode: 'div',
    enabled: true
  },
  {
    type: 'leather',
    renderMode: 'canvas',
    enabled: false  // 暂时禁用
  },
  {
    type: 'paint',
    renderMode: 'canvas',
    enabled: true
  },
  {
    type: 'glass',
    renderMode: 'div',
    enabled: false  // 暂时禁用玻璃效果
  },
  {
    type: 'glow',
    renderMode: 'canvas',
    enabled: false  // 暂时禁用
  },
  {
    type: 'frosted',
    renderMode: 'div',
    enabled: true  // 启用磨砂玻璃效果
  }
];

// 获取启用的材质类型列表
export const getEnabledTextures = (): TextureType[] => {
  return textureConfigs
    .filter(config => config.enabled)
    .map(config => config.type);
};

// 获取材质配置
export const getTextureConfig = (type: TextureType): TextureConfig | undefined => {
  return textureConfigs.find(config => config.type === type);
};
