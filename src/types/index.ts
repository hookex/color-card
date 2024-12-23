export interface ColorCard {
  color: string;
  name?: string;
  zhName: string;
  pinyin?: string;
  rgb?: string;
  cmyk?: string;
  description: string;
  year?: number;
}

export interface ColorInfo {
  color: string;
  name: string;
  zhName: string;
  pinyin: string;
  rgb: string;
  cmyk: string;
  description: string;
  year: number;
}

export type TextureType = 'none' | 'ink' | 'paper' | 'xuan' | 'silk';
