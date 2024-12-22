import { TextureType } from '../components/TextureTools';
import { ColorCardState } from '../stores/useStore';
import createLogger from './logger';

const logger = createLogger('storage');

const STORAGE_KEY = 'colorcard_devtools_state';
const STORE_KEY = 'colorcard_store_state';

export interface DevToolsState {
  debug: boolean;
  mode: 'canvas' | 'div';
  language: string;
  texture: TextureType;
}

export type StoreState = ColorCardState;

export const saveDevToolsState = (state: DevToolsState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    logger.info('DevTools state saved:', state);
  } catch (error) {
    logger.error('Failed to save DevTools state:', error);
  }
};

export const loadDevToolsState = (): DevToolsState | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const state = JSON.parse(savedState) as DevToolsState;
      logger.info('DevTools state loaded:', state);
      return state;
    }
  } catch (error) {
    logger.error('Failed to load DevTools state:', error);
  }
  return null;
};

export const saveStoreState = (state: StoreState) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    logger.info('Store state saved:', state);
  } catch (error) {
    logger.error('Failed to save store state:', error);
  }
};

export const loadStoreState = (): StoreState | null => {
  try {
    const savedState = localStorage.getItem(STORE_KEY);
    if (savedState) {
      const state = JSON.parse(savedState) as StoreState;
      logger.info('Store state loaded:', state);
      return state;
    }
    return null;
  } catch (error) {
    logger.error('Failed to load store state:', error);
    return null;
  }
};
