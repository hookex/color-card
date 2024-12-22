import { TextureType } from '../components/TextureTools';

export type RenderMode = 'div' | 'canvas';

interface TextureConfig {
  renderMode: RenderMode;
}

export const textureConfigs: Record<TextureType, TextureConfig> = {
  solid: {
    renderMode: 'div'
  },
  linear: {
    renderMode: 'div'
  },
  leather: {
    renderMode: 'canvas'
  },
  paint: {
    renderMode: 'canvas'
  },
  glass: {
    renderMode: 'canvas'
  },
  glow: {
    renderMode: 'canvas'
  },
  frosted: {
    renderMode: 'canvas'
  }
};
