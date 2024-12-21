import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TextureType } from '../components/TextureTools';

interface ColorCardState {
  color: string;
  texture: TextureType;
  debug: boolean;
  setColor: (color: string) => void;
  setTexture: (texture: TextureType) => void;
  setDebug: (debug: boolean) => void;
}

const initialState = {
  color: '#f5f5f5',
  texture: 'solid' as TextureType,
  debug: false,
};

export const useStore = create<ColorCardState>()(
  persist(
    (set) => ({
      ...initialState,
      setColor: (color) => {
        console.log('Store: Setting color to', color);
        set((state) => {
          console.log('Store: Previous state', state);
          return { ...state, color };
        });
      },
      setTexture: (texture) => {
        console.log('Store: Setting texture to', texture);
        set((state) => {
          console.log('Store: Previous state', state);
          return { ...state, texture };
        });
      },
      setDebug: (debug) => {
        console.log('Store: Setting debug to', debug);
        set((state) => {
          console.log('Store: Previous state', state);
          return { ...state, debug };
        });
      },
    }),
    {
      name: 'color-card-storage',
      version: 1,
    }
  )
);

export default useStore;
