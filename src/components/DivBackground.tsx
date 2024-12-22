import React from 'react';
import { TextureType } from './TextureTools';
import { useBackground } from '../hooks/useBackground';
import { getTextureStyles } from '../utils/divBackgroundUtils';

interface Props {
  color: string;
  texture: TextureType;
  debug?: boolean;
}

const DivBackground: React.FC<Props> = ({ color, texture, debug = false }) => {
  const state = useBackground(color, texture, debug);
  const textureStyles = getTextureStyles(state.texture);

  return (
    <div
      className="background"
      style={{
        ...textureStyles,
        backgroundColor: state.color,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        transition: 'all 0.3s ease-in-out',
      }}
    />
  );
};

export default DivBackground;
