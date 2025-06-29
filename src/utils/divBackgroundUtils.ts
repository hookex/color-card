import { TextureType } from '../components/TextureTools';
import { CSSProperties } from 'react';

interface TextureStylesProps {
  texture: TextureType;
  startColor?: string;
  endColor?: string;
}

// 将颜色转换为RGBA格式，alpha为0.618
const toRGBA = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.618)`;
};

/**
 * 获取纹理对应的样式
 */
export const getTextureStyles = ({ texture, startColor, endColor }: TextureStylesProps): CSSProperties => {
  switch (texture) {
    case 'solid':
      // 原色：纯色背景，没有任何纹理
      return {};
    case 'linear':
      // 线性：纯色背景，没有任何纹理或渐变
      return {};
    case 'leather':
      return {
        backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%)',
        backgroundSize: '20px 20px',
      };
    case 'paint':
      // 玉石：使用canvas渲染，这里返回空样式
      return {};
    case 'glass':
      if (!startColor) return {};
      return {
        backgroundColor: `${toRGBA(startColor)}`,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      };
    case 'frosted':
      // 毛玻璃：使用canvas渲染，这里返回空样式
      return {};
    case 'glow':
      return {
        backgroundImage: `radial-gradient(circle at center, ${startColor || '#ffffff'} 0%, rgba(255,255,255,0) 70%)`,
        filter: 'blur(1px)',
      };
    default:
      return {};
  }
};
