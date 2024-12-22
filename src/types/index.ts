export interface ColorInfo {
  color: string;
  zhName: string;
  description: string;
  cmyk?: string;
  rgb?: string;
  year?: string;
}

export type TextureType = 'none' | 'ink' | 'paper' | 'xuan' | 'silk';
