import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TextureType } from '../components/TextureTools';
import { ColorCard, colorCards as initialColorCards } from '../config/brandColors';
import { loadStoreState, saveStoreState } from '../utils/storage';
import createLogger from '../utils/logger';

const logger = createLogger('store');

// 加载保存的状态
const savedState = loadStoreState();
logger.info('Loaded initial state:', savedState);

interface ColorCardState {
  color: string;
  texture: TextureType;
  debug: boolean;
  mode: 'canvas' | 'div';
  colorCards: ColorCard[];
  hideColorCard: boolean;
  setColor: (color: string) => void;
  setTexture: (texture: TextureType) => void;
  setDebug: (debug: boolean) => void;
  setMode: (mode: 'canvas' | 'div') => void;
  setHideColorCard: (hide: boolean) => void;
  addColorCard: (card: ColorCard) => void;
  removeColorCard: (color: string) => void;
  updateColorCards: (cards: ColorCard[]) => void;
  resetScene: () => void; // 添加重置方法
}

const useStore = create<ColorCardState>()(
  devtools(
    persist(
      (set) => ({
        // 初始状态
        color: savedState?.color || '#FF0000',
        texture: savedState?.texture || 'solid',
        debug: savedState?.debug || false,
        mode: savedState?.mode || 'canvas',
        colorCards: savedState?.colorCards || initialColorCards,
        hideColorCard: savedState?.hideColorCard || false,

        // Actions
        setColor: (color: string) => {
          set({ color });
          const state = useStore.getState();
          saveStoreState(state);
        },
        
        setTexture: (texture: TextureType) => {
          set({ texture });
          const state = useStore.getState();
          saveStoreState(state);
        },
        
        setDebug: (debug: boolean) => {
          set({ debug });
          const state = useStore.getState();
          saveStoreState(state);
        },

        setMode: (mode: 'canvas' | 'div') => {
          set({ mode });
          const state = useStore.getState();
          saveStoreState(state);
        },

        setHideColorCard: (hide: boolean) => {
          set({ hideColorCard: hide });
          const state = useStore.getState();
          saveStoreState(state);
        },

        addColorCard: (card: ColorCard) => {
          set((state) => ({
            colorCards: [...state.colorCards, card]
          }));
          const state = useStore.getState();
          saveStoreState(state);
        },

        removeColorCard: (color: string) => {
          set((state) => ({
            colorCards: state.colorCards.filter((card) => card.color !== color)
          }));
          const state = useStore.getState();
          saveStoreState(state);
        },

        updateColorCards: (cards: ColorCard[]) => {
          set({ colorCards: cards });
          const state = useStore.getState();
          saveStoreState(state);
        },

        // 重置场景到初始状态
        resetScene: () => {
          set({
            color: '#FF0000',
            texture: 'solid',
            debug: false,
            mode: 'canvas',
            colorCards: initialColorCards,
            hideColorCard: false,
          });
          const state = useStore.getState();
          saveStoreState(state);
        },
      }),
      {
        name: 'colorcard-storage',
        storage: {
          getItem: () => {
            const state = loadStoreState();
            return Promise.resolve(state);
          },
          setItem: (_key, value) => {
            saveStoreState(value);
            return Promise.resolve();
          },
          removeItem: () => Promise.resolve(),
        },
      }
    ),
    {
      name: 'ColorCard',
      enabled: true,
    }
  )
);

export default useStore;
