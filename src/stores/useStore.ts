import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TextureType } from '../components/TextureTools';
import { ColorCard, colorCards as initialColorCards } from '../config/brandColors';
import { loadStoreState, saveStoreState, StoreState } from '../utils/storage';
import createLogger from '../utils/logger';
import { textureConfigs } from '../config/textureConfig';

const logger = createLogger('store');

// 加载保存的状态
const savedState = loadStoreState();
logger.info('Loaded initial state:', savedState);

export type ColorType = 'brand' | 'chinese' | 'nature' | 'food' | 'mood' | 'space';

export interface ColorCardState {
  color: string;
  texture: TextureType;
  debug: boolean;
  mode: 'canvas' | 'div';
  colorCards: ColorCard[];
  hideColorCard: boolean;
  selectedColor: string;
  colorType: ColorType;
  setSelectedColor: (color: string) => void;
  selectedTexture: TextureType;
  setSelectedTexture: (texture: TextureType) => void;
  setColor: (color: string) => void;
  setTexture: (texture: TextureType) => void;
  setDebug: (debug: boolean) => void;
  setMode: (mode: 'canvas' | 'div') => void;
  setHideColorCard: (hide: boolean) => void;
  setColorType: (type: ColorType) => void;
  addColorCard: (card: ColorCard) => void;
  removeColorCard: (color: string) => void;
  updateColorCards: (cards: ColorCard[]) => void;
  resetScene: () => void;
}

const useStore = create<ColorCardState>()(
  persist(
    devtools(
      (set, get): ColorCardState => ({
        // 初始状态
        color: savedState?.color || '#FF0000',
        texture: savedState?.texture || 'solid' as TextureType,
        debug: savedState?.debug || false,
        mode: savedState?.mode || 'canvas' as const,
        colorCards: savedState?.colorCards || initialColorCards,
        hideColorCard: savedState?.hideColorCard || false,
        selectedColor: savedState?.selectedColor || '#FFFFFF',
        selectedTexture: savedState?.selectedTexture || 'solid' as TextureType,
        colorType: savedState?.colorType || 'brand',

        // Actions
        setColor: (color: string) => {
          set({ color });
          const state = get();
          saveStoreState(state);
        },
        
        setTexture: (texture: TextureType) => {
          // 使用 find 方法找到对应的纹理配置，如果没找到则使用默认配置
          const textureConfig = textureConfigs.find(config => config.type === texture) || {
            type: texture,
            renderMode: 'div', // 默认渲染模式
            enabled: true
          };
          
          logger.info('Setting texture:', { texture, config: textureConfig });
          
          set({ 
            texture, 
            mode: textureConfig.renderMode 
          });
          
          const state = get();
          saveStoreState(state);
        },
        
        setDebug: (debug: boolean) => {
          set({ debug });
          const state = get();
          saveStoreState(state);
        },

        setMode: (mode: 'canvas' | 'div') => {
          set({ mode });
          const state = get();
          saveStoreState(state);
        },

        setHideColorCard: (hide: boolean) => {
          set({ hideColorCard: hide });
          const state = get();
          saveStoreState(state);
        },

        setSelectedColor: (color: string) => {
          set({ selectedColor: color });
          const state = get();
          saveStoreState(state);
        },

        setSelectedTexture: (texture: TextureType) => {
          set({ selectedTexture: texture });
          const state = get();
          saveStoreState(state);
        },

        setColorType: (type: ColorType) => {
          set({ colorType: type });
          const state = get();
          saveStoreState(state);
        },

        addColorCard: (card: ColorCard) => {
          const currentCards = get().colorCards;
          set({ colorCards: [...currentCards, card] });
          const state = get();
          saveStoreState(state);
        },

        removeColorCard: (color: string) => {
          const currentCards = get().colorCards;
          set({ colorCards: currentCards.filter(card => card.color !== color) });
          const state = get();
          saveStoreState(state);
        },

        updateColorCards: (cards: ColorCard[]) => {
          set({ colorCards: cards });
          const state = get();
          saveStoreState(state);
        },

        resetScene: () => {
          set({
            color: '#FF0000',
            texture: 'solid' as TextureType,
            debug: false,
            mode: 'canvas' as const,
            colorCards: initialColorCards,
            hideColorCard: false,
            selectedColor: '#FFFFFF',
            selectedTexture: 'solid' as TextureType,
            colorType: 'brand',
          });
          const state = get();
          saveStoreState(state);
        },
      }),
      {
        name: 'ColorCard',
        enabled: true,
      }
    ),
    {
      name: 'color-card-storage',
      getStorage: () => ({
        getItem: () => {
          return Promise.resolve(null);
        },
        setItem: (_key, value) => {
          saveStoreState(JSON.parse(value));
          return Promise.resolve();
        },
        removeItem: () => Promise.resolve(),
      }),
    }
  )
);

export default useStore;
