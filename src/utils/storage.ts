import { TextureType } from '../components/TextureTools';
import createLogger from './logger';

const logger = createLogger('storage');

const STORAGE_KEY = 'colorcard_devtools_state';

export interface DevToolsState {
  debug: boolean;
  mode: 'canvas' | 'div';
  language: string;
  texture: TextureType;
}

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
