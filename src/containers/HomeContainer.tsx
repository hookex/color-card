/**
 * Home页面容器组件
 * 负责管理Home页面的整体逻辑和状态协调
 * 
 * @description 主要职责：
 * - 整合各种业务逻辑Hook
 * - 管理页面级别的状态
 * - 协调子组件间的交互
 * - 处理URL参数和路由逻辑
 * - 提供统一的错误处理
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAppStoreSelectors, useAppStore } from '../stores/useAppStore';
import { 
  useColorSelection, 
  useTextureManagement, 
  useWallpaperGeneration,
  usePageTransition,
  useGestureHandler,
  GestureType
} from '../hooks';
import { ColorType } from '../stores/slices/colorSlice';
import { LazyCanvasBackground } from '../components/lazy';
import DivBackground from '../components/DivBackground';
import ColorTypeSegment from '../components/features/ColorTypeSegment';
import ColorGrid from '../components/features/ColorGrid';
import TextureToolbar from '../components/features/TextureToolbar';
import SaveButton from '../components/features/SaveButton';
import createLogger from '../utils/logger';
import { withDefaultErrorBoundary } from '../components/withErrorBoundary';
import './HomeContainer.scss';

const logger = createLogger('HomeContainer');

/**
 * Home容器组件
 */
const HomeContainer: React.FC = () => {
  const contentRef = useRef<HTMLIonContentElement>(null);

  // 全局状态
  const isMinimized = useAppStoreSelectors.useIsMinimized();
  const showSaveButton = useAppStoreSelectors.useShowSaveButton();

  // 业务逻辑Hooks
  const colorSelection = useColorSelection();
  const textureManagement = useTextureManagement();
  const wallpaperGeneration = useWallpaperGeneration();

  // UI交互Hooks
  const pageTransition = usePageTransition();

  /**
   * 处理颜色类型变化（带动画）
   */
  const handleColorTypeChange = useCallback(async (newType: ColorType) => {
    if (!newType || newType === colorSelection.colorType || pageTransition.isTransitioning) {
      return;
    }

    logger.info('Handling color type change with animation:', newType);

    try {
      // 确定滑动方向
      const colorTypes: ColorType[] = ['brand', 'chinese', 'nature', 'food', 'mood', 'space'];
      const currentIndex = colorTypes.indexOf(colorSelection.colorType);
      const newIndex = colorTypes.indexOf(newType);
      const direction = newIndex > currentIndex ? 'left' : 'right';

      // 开始页面过渡动画
      await pageTransition.startTransition(direction, () => {
        // 在动画过程中切换内容
        colorSelection.changeColorType(newType);
      });

      logger.info('Color type change completed with animation');
    } catch (error) {
      logger.error('Failed to handle color type change:', error);
      
      // 如果动画失败，仍然切换颜色类型
      colorSelection.changeColorType(newType);
    }
  }, [colorSelection, pageTransition]);

  /**
   * 手势事件处理
   */
  const handleGesture = useCallback(async (event: any) => {
    const { type } = event;
    
    switch (type) {
      case GestureType.SwipeLeft:
      case GestureType.SwipeRight:
        // 处理滑动切换颜色类型
        const colorTypes: ColorType[] = ['brand', 'chinese', 'nature', 'food', 'mood', 'space'];
        const currentIndex = colorTypes.indexOf(colorSelection.colorType);
        
        let newIndex: number;
        if (type === GestureType.SwipeLeft && currentIndex < colorTypes.length - 1) {
          newIndex = currentIndex + 1;
        } else if (type === GestureType.SwipeRight && currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else {
          return; // 无法切换
        }
        
        await handleColorTypeChange(colorTypes[newIndex]);
        break;
        
      case GestureType.TwoFingerTap:
      case GestureType.RightClick:
        // 处理最小化切换
        // 这里需要直接调用store的方法
        const store = useAppStore.getState();
        store.toggleMinimized();
        break;
    }
  }, [colorSelection, handleColorTypeChange]);

  // 手势处理
  const gestureHandler = useGestureHandler(
    contentRef,
    handleGesture,
    {
      swipe: {
        threshold: 15,
        velocity: 0.2,
        debounceTime: 500,
        horizontal: true,
        vertical: false
      },
      twoFinger: {
        threshold: 10,
        debounceTime: 300
      },
      contextMenu: {
        debounceTime: 200
      }
    }
  );

  /**
   * 初始化组件
   */
  useEffect(() => {
    logger.info('HomeContainer initialized');
    
    return () => {
      logger.info('HomeContainer cleanup');
    };
  }, []);

  /**
   * 渲染背景组件
   */
  const renderBackground = useCallback(() => {
    return textureManagement.shouldUseCanvas() ? <LazyCanvasBackground /> : <DivBackground />;
  }, [textureManagement.shouldUseCanvas]);

  return (
    <IonPage className="home-page">
      {renderBackground()}
      
      <IonContent 
        ref={contentRef} 
        className="ion-content-transparent"
      >
        <div className={`home-container ${isMinimized ? 'minimized' : ''}`}>
          {!isMinimized && (
            <>
              {/* 颜色类型选择器 */}
              <div className="color-type-section">
                <ColorTypeSegment 
                  value={colorSelection.colorType}
                  onSelectionChange={handleColorTypeChange}
                />
              </div>
              
              {/* 颜色网格 - 带动画容器 */}
              <div className="color-grid-section">
                <ColorGrid
                  springProps={pageTransition.springProps}
                  colorType={colorSelection.colorType}
                  selectedColor={colorSelection.color}
                  onColorSelect={colorSelection.selectColor}
                  favoriteColors={colorSelection.favoriteColors}
                  onToggleFavorite={colorSelection.toggleFavorite}
                />
              </div>
              
              {/* 纹理工具栏 */}
              <div className="texture-toolbar-section">
                <TextureToolbar
                  texture={textureManagement.texture}
                  onTextureChange={textureManagement.selectTexture}
                />
              </div>
            </>
          )}
          
          {/* 保存按钮 */}
          {showSaveButton && (
            <div className="save-button-section">
              <SaveButton
                onSave={wallpaperGeneration.saveToDevice}
                onShare={wallpaperGeneration.shareWallpaper}
                isSaving={wallpaperGeneration.isSaving}
                disabled={pageTransition.isTransitioning || gestureHandler.isGestureProcessing}
              />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default withDefaultErrorBoundary(React.memo(HomeContainer));