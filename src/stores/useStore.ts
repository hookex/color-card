import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TextureType } from '../components/TextureTools';
import { ColorCard, colorCards as initialColorCards } from '../config/brandColors';
import { loadDevToolsState, saveDevToolsState } from '../utils/storage';
import createLogger from '../utils/logger';

const logger = createLogger('store');

// 加载保存的开发工具状态
const savedState = loadDevToolsState();
logger.info('Loaded initial state:', savedState);

interface ColorCardState {
  color: string;
  texture: TextureType;
  debug: boolean;
  mode: 'canvas' | 'div';
  colorCards: ColorCard[];
  setColor: (color: string) => void;
  setTexture: (texture: TextureType) => void;
  setDebug: (debug: boolean) => void;
  setMode: (mode: 'canvas' | 'div') => void;
  addColorCard: (card: ColorCard) => void;
  removeColorCard: (color: string) => void;
  updateColorCards: (cards: ColorCard[]) => void;
}

const useStore = create<ColorCardState>()(
  devtools(
    (set) => ({
      // 初始状态
      color: '#FF0000',
      texture: savedState?.texture || 'solid',
      debug: savedState?.debug || false,
      mode: savedState?.mode || 'canvas',
      colorCards: initialColorCards,

      // Actions
      setColor: (color: string) => set({ color }),
      
      setTexture: (texture: TextureType) => {
        set({ texture });
        // 保存纹理类型到 localStorage
        const currentState = loadDevToolsState() || {};
        saveDevToolsState({ ...currentState, texture });
      },
      
      setDebug: (debug: boolean) => {
        set({ debug });
        const currentState = loadDevToolsState() || {};
        saveDevToolsState({ ...currentState, debug });
      },
      
      setMode: (mode: 'canvas' | 'div') => {
        set({ mode });
        const currentState = loadDevToolsState() || {};
        saveDevToolsState({ ...currentState, mode });
      },

      addColorCard: (card: ColorCard) =>
        set((state) => ({
          colorCards: [...state.colorCards, card],
        })),

      removeColorCard: (color: string) =>
        set((state) => ({
          colorCards: state.colorCards.filter((card) => card.color !== color),
        })),

      updateColorCards: (cards: ColorCard[]) =>
        set({ colorCards: cards }),
    }),
    {
      name: 'ColorCard',
      enabled: true,
    }
  )
);

export default useStore;
