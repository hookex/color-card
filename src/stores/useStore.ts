import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TextureType } from '../components/TextureTools';
import { ColorCard, colorCards as initialColorCards } from '../config/brandColors';
import { loadStoreState, saveStoreState } from '../utils/storage';
import createLogger from '../utils/logger';
import { textureConfigs } from '../config/textureConfig';

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
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedTexture: TextureType;
  setSelectedTexture: (texture: TextureType) => void;
  hasCompletedTutorial: boolean;
  setHasCompletedTutorial: (completed: boolean) => void;
  setColor: (color: string) => void;
  setTexture: (texture: TextureType) => void;
  setDebug: (debug: boolean) => void;
  setMode: (mode: 'canvas' | 'div') => void;
  setHideColorCard: (hide: boolean) => void;
  addColorCard: (card: ColorCard) => void;
  removeColorCard: (color: string) => void;
  updateColorCards: (cards: ColorCard[]) => void;
  resetScene: () => void;
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
        selectedColor: savedState?.selectedColor || '#FFFFFF',
        selectedTexture: savedState?.selectedTexture || 'solid',
        hasCompletedTutorial: savedState?.hasCompletedTutorial || localStorage.getItem('hasCompletedTutorial') === 'true',

        // Actions
        setColor: (color: string) => {
          set({ color });
          const state = useStore.getState();
          saveStoreState(state);
        },
        
        setTexture: (texture: TextureType) => {
          logger.info('Setting texture:', { texture, config: textureConfigs[texture] });
          const { renderMode } = textureConfigs[texture];
          set({ texture, mode: renderMode });
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

        setSelectedColor: (color: string) => {
          set({ selectedColor: color });
          const state = useStore.getState();
          saveStoreState(state);
        },

        setSelectedTexture: (texture: TextureType) => {
          set({ selectedTexture: texture });
          const state = useStore.getState();
          saveStoreState(state);
        },

        setHasCompletedTutorial: (completed: boolean) => {
          localStorage.setItem('hasCompletedTutorial', String(completed));
          set({ hasCompletedTutorial: completed });
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
            selectedColor: '#FFFFFF',
            selectedTexture: 'solid',
            hasCompletedTutorial: localStorage.getItem('hasCompletedTutorial') === 'true',
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
