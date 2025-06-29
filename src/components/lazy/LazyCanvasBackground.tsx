/**
 * 懒加载Canvas背景组件
 * 用于性能优化，仅在需要时加载重量级的Canvas组件
 */

import React, { lazy, Suspense } from 'react';
import createLogger from '../../utils/logger';
import './LazyCanvasBackground.scss';

const logger = createLogger('LazyCanvasBackground');

// 懒加载Canvas背景组件
const CanvasBackground = lazy(() => 
  import('../CanvasBackground').then(module => {
    logger.info('CanvasBackground component loaded');
    return module;
  })
);

/**
 * Canvas背景加载组件
 */
const CanvasBackgroundFallback: React.FC = () => (
  <div className="canvas-background-fallback">
    <div className="canvas-background-fallback__message">
      正在加载3D背景...
    </div>
  </div>
);

/**
 * 懒加载Canvas背景组件
 */
const LazyCanvasBackground: React.FC = () => {
  return (
    <Suspense fallback={<CanvasBackgroundFallback />}>
      <CanvasBackground />
    </Suspense>
  );
};

export default LazyCanvasBackground;