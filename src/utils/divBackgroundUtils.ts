import { TextureType } from '../components/TextureTools';
import { CSSProperties } from 'react';

/**
 * 获取纹理对应的样式
 */
export const getTextureStyles = (texture: TextureType): CSSProperties => {
  switch (texture) {
    case 'solid':
      return {};
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
      return {
        backdropFilter: 'blur(10px)',
        opacity: 0.8,
      };
    default:
      return {};
  }
};
