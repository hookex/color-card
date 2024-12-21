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

export const useStore = create<ColorCardState>()(
  persist(
    (set) => ({
      color: '#f5f5f5',
      texture: 'solid',
      debug: false,
      setColor: (color) => set({ color }),
      setTexture: (texture) => set({ texture }),
      setDebug: (debug) => set({ debug }),
    }),
    {
      name: 'color-card-storage',
    }
  )
);

export default useStore;
