/**
 * UI相关Hooks统一导出入口
 * 提供所有UI交互相关Hooks的集中访问点
 */

export { usePageTransition } from './usePageTransition';
export type { UsePageTransitionReturn } from './usePageTransition';

export { useGestureHandler, GestureType } from './useGestureHandler';
export type { 
  UseGestureHandlerReturn, 
  GestureEvent, 
  GestureConfig, 
  GestureHandlerConfig 
} from './useGestureHandler';