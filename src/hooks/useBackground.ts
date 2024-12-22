import { useState, useEffect } from 'react';
import { TextureType } from '../components/TextureTools';

interface BackgroundState {
  color: string;
  texture: TextureType;
  debug: boolean;
}

export const useBackground = (
  color: string,
  texture: TextureType,
  debug: boolean = false
): BackgroundState => {
  const [state, setState] = useState<BackgroundState>({
    color,
    texture,
    debug,
  });

  useEffect(() => {
    setState({ color, texture, debug });
  }, [color, texture, debug]);

  return state;
};
