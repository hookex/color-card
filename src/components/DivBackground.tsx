import React from 'react';
import { TextureType } from './TextureTools';
import { getTextureStyles } from '../utils/divBackgroundUtils';
import createLogger from '../utils/logger';
import useStore from '../stores/useStore';

const logger = createLogger('divBackground');

interface Props {
  color: string;
  texture: TextureType;
  debug?: boolean;
}

const DivBackground: React.FC = () => {
  const color = useStore(state => state.color);
  const texture = useStore(state => state.texture);
  const debug = useStore(state => state.debug);
  
  const textureStyles = getTextureStyles(texture);
  
  logger.info('Rendering DivBackground:', { color, texture, debug });
console.log('color, ', color)
  return (
    <div
      className="background"
      style={{
        ...textureStyles,
        backgroundColor: color,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        transition: 'all 0.3s ease-in-out',
      }}
    />
  );
};

export default DivBackground;
