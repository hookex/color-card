import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TextureType } from '../components/TextureTools';
import { ColorCard, colorCards as initialColorCards } from '../config/brandColors';
import { loadDevToolsState } from '../utils/storage';
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
      color: savedState?.color ?? initialColorCards[0].color,
      texture: savedState?.texture ?? 'solid',
      debug: savedState?.debug ?? false,
      mode: savedState?.mode ?? 'div',
      colorCards: savedState?.colorCards ?? initialColorCards,

      // Actions
      setColor: (color) => {
        logger.info('Setting color:', color);
        set({ color }, false, 'setColor');
      },
      setTexture: (texture) => {
        logger.info('Setting texture:', texture);
        set({ texture }, false, 'setTexture');
      },
      setDebug: (debug) => {
        logger.info('Setting debug mode:', debug);
        set({ debug }, false, 'setDebug');
      },
      setMode: (mode) => {
        logger.info('Setting render mode:', mode);
        set((state) => ({ mode }), false, 'setMode');
      },
      addColorCard: (card) => {
        set(
          (state) => ({
            colorCards: [...state.colorCards, card],
          }),
          false,
          'addColorCard'
        );
      },
      removeColorCard: (color) => {
        set(
          (state) => ({
            colorCards: state.colorCards.filter((card) => card.color !== color),
          }),
          false,
          'removeColorCard'
        );
      },
      updateColorCards: (cards) => {
        set({ colorCards: cards }, false, 'updateColorCards');
      },
    }),
    {
      name: 'ColorCard',
      enabled: true,
    }
  )
);

export default useStore;
