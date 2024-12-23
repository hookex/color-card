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
      return {};
    case 'linear':
      if (!startColor) return {};
      // 使用原色到淡白色的渐变
      return {
        background: `linear-gradient(to bottom, ${startColor}, ${toRGBA(startColor)})`
      };
    case 'leather':
      return {
        backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.1) 75%)',
        backgroundSize: '20px 20px',
      };
    case 'paint':
      return {
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.1) 100%)',
      };
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
      if (!startColor) return {};
      return {
        backgroundColor: `${toRGBA(startColor)}`,
        backdropFilter: 'blur(10px) saturate(120%)',
        WebkitBackdropFilter: 'blur(10px) saturate(120%)',
        boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      };
    default:
      return {};
  }
};
