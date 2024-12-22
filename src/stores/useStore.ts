import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TextureType } from '../components/TextureTools';
import { ColorCard, colorCards as initialColorCards } from '../config/brandColors';

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
      color: initialColorCards[0].color,
      texture: 'solid',
      debug: false,
      mode: 'div',
      colorCards: initialColorCards,

      // Actions
      setColor: (color) => set({ color }, false, 'setColor'),
      setTexture: (texture) => set({ texture }, false, 'setTexture'),
      setDebug: (debug) => set({ debug }, false, 'setDebug'),
      setMode: (mode) => set({ mode }, false, 'setMode'),
      addColorCard: (card) => 
        set(
          (state) => ({ 
            colorCards: [...state.colorCards, card] 
          }),
          false,
          'addColorCard'
        ),
      removeColorCard: (color) =>
        set(
          (state) => ({
            colorCards: state.colorCards.filter(c => c.color !== color)
          }),
          false,
          'removeColorCard'
        ),
      updateColorCards: (cards) =>
        set(
          { colorCards: cards },
          false,
          'updateColorCards'
        ),
    }),
    {
      name: 'ColorCard',
      enabled: true,
    }
  )
);

export default useStore;
