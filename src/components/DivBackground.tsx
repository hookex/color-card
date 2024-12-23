import React from 'react';
import { TextureType } from './TextureTools';
import { getTextureStyles } from '../utils/divBackgroundUtils';
import createLogger from '../utils/logger';
import useStore from '../stores/useStore';
import backgroundImage from '../assets/background.jpg';

const logger = createLogger('divBackground');

const DivBackground: React.FC = () => {
  const color = useStore(state => state.color);
  const texture = useStore(state => state.texture);
  const debug = useStore(state => state.debug);
  
  // 获取纹理样式，但不包含背景色
  const textureStyles = getTextureStyles({ texture, startColor: color });
  
  // 背景图样式
  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -2,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.8
  };

  // 构建最终的样式对象
  const finalStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    transition: 'all 0.3s ease-in-out',
    ...(texture === 'linear' || texture === 'glass' || texture === 'frosted' ? textureStyles : { backgroundColor: color }),
  };
  
  logger.info('Rendering DivBackground:', { color, texture, debug });

  return (
    <>
      <div style={backgroundStyle} />
      <div style={finalStyles} />
    </>
  );
};

export default DivBackground;
