import React, { useEffect, useState, useRef } from 'react';
import { IonContent, IonPage, IonFabButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, createGesture } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { save } from 'ionicons/icons';
import { useSpring, animated, config } from '@react-spring/web';
import useStore, { ColorType } from '../stores/useStore';
import ColorCard from '../components/ColorCard';
import TextureTools from '../components/TextureTools';
import LiquidGlassSegment from '../components/LiquidGlassSegment';
import LiquidGlassTextureTools from '../components/LiquidGlassTextureTools';
import { takeScreenshot } from '../utils/screenshot';
import createLogger  from '../utils/logger';
import CanvasBackground from '../components/CanvasBackground';
import DivBackground from '../components/DivBackground';
import { getContrastColor, getGlassOpacity } from '../utils/backgroundUtils';
import './Home.scss';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';
import { TextureType } from '../components/TextureTools';
import { colorCards as brandColors } from '../config/brandColors';
import { chineseColors, natureColors, foodColors, moodColors, spaceColors } from '../config/colorTypes';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { tabs } from '../config/tabConfig';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const logger = createLogger('Home');
  const contentRef = useRef<HTMLIonContentElement>(null);
  const history = useHistory();
  const location = useLocation();

  const {
    color,
    texture,
    debug,
    mode,
    hideColorCard,
    colorType,
    setColor: updateColor,
    setTexture: updateTexture,
    setMode,
    setHideColorCard,
    setColorType,
  } = useStore();

  const [showSaveButton, setShowSaveButton] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGestureProcessing, setIsGestureProcessing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // React Spring animation for smooth transitions
  const [springProps, api] = useSpring(() => ({
    opacity: 1,
    transform: 'translateX(0%)',
    config: {
      tension: 280,
      friction: 60,
      mass: 1,
      clamp: true // 防止过度振荡
    }
  }));

  // 从URL参数初始化texture和colorType
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlTexture = urlParams.get('texture') as TextureType;
    const urlColorType = urlParams.get('colorType') as ColorType;
    
    if (urlTexture && urlTexture !== texture) {
      // 验证texture类型是否有效
      const validTextures: TextureType[] = ['solid', 'leather', 'paint', 'glass', 'linear', 'glow', 'frosted'];
      if (validTextures.includes(urlTexture)) {
        updateTexture(urlTexture);
        logger.info('Initialized texture from URL:', urlTexture);
      }
    }
    
    if (urlColorType && urlColorType !== colorType) {
      // 验证colorType是否有效
      const validColorTypes: ColorType[] = ['brand', 'chinese', 'nature', 'food', 'mood', 'space'];
      if (validColorTypes.includes(urlColorType)) {
        setColorType(urlColorType);
        logger.info('Initialized colorType from URL:', urlColorType);
      }
    }
  }, [location.search, texture, colorType, updateTexture, setColorType]);

  // 更新URL参数
  const updateUrlParams = (newTexture?: TextureType, newColorType?: ColorType) => {
    const urlParams = new URLSearchParams(location.search);
    
    if (newTexture) {
      urlParams.set('texture', newTexture);
    }
    
    if (newColorType) {
      urlParams.set('colorType', newColorType);
    }
    
    // 使用replace而不是push，避免在浏览器历史中创建过多条目
    history.replace({
      pathname: location.pathname,
      search: urlParams.toString()
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const dragWidth = width * 0.3;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    const gesture = createGesture({
      el: contentRef.current,
      threshold: 15,
      gestureName: 'swipe-segment',
      onMove: (detail) => {
        if (isGestureProcessing) return;
        
        const velocity = detail.velocityX;
        const deltaX = detail.deltaX;
        
        if (Math.abs(velocity) > 0.2 && Math.abs(deltaX) > 50) {
          setIsGestureProcessing(true);
          const colorTypes: ColorType[] = ['brand', 'chinese', 'nature', 'food', 'mood', 'space'];
          const currentIndex = colorTypes.indexOf(colorType);
          
          if (velocity < 0 && currentIndex < colorTypes.length - 1) {
            // Swipe left - go to next
            handleColorTypeChange(colorTypes[currentIndex + 1]);
          } else if (velocity > 0 && currentIndex > 0) {
            // Swipe right - go to previous
            handleColorTypeChange(colorTypes[currentIndex - 1]);
          }
          
          // Reset processing flag after gesture completes
          setTimeout(() => setIsGestureProcessing(false), 500);
        }
      }
    });

    gesture.enable();
    return () => gesture.destroy();
  }, [colorType, isGestureProcessing]);

  useEffect(() => {
    if (!contentRef.current) return;

    const twoFingerGesture = createGesture({
      el: contentRef.current,
      gestureName: 'two-finger-swipe',
      threshold: 10,
      canStart: (detail: any) => {
        // Ensure two fingers are used
        return detail.event.touches.length === 2;
      },
      onStart: () => {
        // Toggle minimized state
        setIsMinimized(prev => !prev);
        
        // Provide haptic feedback
        try {
          Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
          logger.error('Haptics not available:', error);
        }
      }
    });

    twoFingerGesture.enable();
    return () => twoFingerGesture.destroy();
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent default right-click menu
      e.preventDefault();
      
      // Toggle minimized state
      setIsMinimized(prev => !prev);
      
      // Provide haptic feedback
      try {
        Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        logger.error('Haptics not available:', error);
      }
    };

    const currentElement = contentRef.current;
    currentElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      currentElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const handleCardClick = async (newColor: string) => {
    logger.info('Changing color:', newColor);
    updateColor(newColor);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      logger.error('Haptics not available:', error);
    }
  };

  const handleTextureChange = async (newTexture: TextureType) => {
    logger.info('Setting new texture:', newTexture);
    updateTexture(newTexture);
    updateUrlParams(newTexture);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      logger.error('Haptics not available:', error);
    }
  };

  const getCardStyle = (color: string) => ({
    '--card-color': color,
    '--text-color': getContrastColor(color)
  } as React.CSSProperties);

  const currentMode = useStore(state => state.mode);

  const handleSave = async () => {
    try {
      if (shouldUseCanvas()) {
        await handleCanvasSave();
      } else {
        await handleDivSave();
      }
    } catch (error) {
      logger.error('Error saving:', error);
    }
  };

  const handleCanvasSave = async () => {
    try {
      const result = await takeScreenshot('canvas');
      if (result.success) {
        console.log('Wallpaper saved:', result.fileName);
      } else {
        console.error('Failed to save wallpaper:', result.error);
      }
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  };

  const handleDivSave = async () => {
    try {
      const result = await takeScreenshot('div');
      if (result.success) {
        console.log('Wallpaper saved:', result.fileName);
      } else {
        console.error('Failed to save wallpaper:', result.error);
      }
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  };

  const handleSetWallpaper = async () => {
    try {
      await handleSave();
    } catch (error) {
      console.error('Failed to set wallpaper:', error);
    }
  };

  const handleColorTypeChange = async (newType: ColorType) => {
    if (!newType || newType === colorType || isTransitioning) return;
    
    setIsTransitioning(true);
    
    const colorTypes: ColorType[] = ['brand', 'chinese', 'nature', 'food', 'mood', 'space'];
    const currentIndex = colorTypes.indexOf(colorType);
    const newIndex = colorTypes.indexOf(newType);
    
    // Determine slide direction based on index change
    const slideDirection = newIndex > currentIndex ? 'left' : 'right';
    const slideOutTransform = slideDirection === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    const slideInTransform = slideDirection === 'left' ? 'translateX(100%)' : 'translateX(-100%)';
    
    try {
      // Start slide out animation with no overshoot
      await api.start({
        opacity: 0,
        transform: slideOutTransform,
        config: {
          tension: 300,
          friction: 40,
          mass: 1,
          clamp: true
        }
      });
      
      // Change content during transition
      setColorType(newType);
      updateUrlParams(undefined, newType);
      
      // Set initial position for slide in
      api.set({
        opacity: 0,
        transform: slideInTransform
      });
      
      // Start slide in animation with smooth deceleration
      await api.start({
        opacity: 1,
        transform: 'translateX(0%)',
        config: {
          tension: 280,
          friction: 60,
          mass: 1,
          clamp: true // 完全防止弹跳
        }
      });
      
      setIsTransitioning(false);
      
      // Haptic feedback
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      logger.error('Animation or haptics error:', error);
      setIsTransitioning(false);
    }
  };

  const getColorCards = () => {
    switch (colorType) {
      case 'brand':
        return brandColors;
      case 'chinese':
        return chineseColors;
      case 'nature':
        return natureColors;
      case 'food':
        return foodColors;
      case 'mood':
        return moodColors;
      case 'space':
        return spaceColors;
      default:
        return brandColors;
    }
  };

  useEffect(() => {
    if (hideColorCard) {
      setShowSaveButton(true);
    } else {
      setShowSaveButton(false);
    }
  }, [hideColorCard]);

  const filteredCards = getColorCards().filter(card => {
    // Ensure required properties exist before filtering
    const hasRequiredProps = card.zhName && card.description;
    return hasRequiredProps;
  });

  // 根据纹理类型决定渲染方式
  const shouldUseCanvas = () => {
    return texture === 'paint' || texture === 'frosted'; // 玉石和毛玻璃使用canvas
  };

  return (
    <IonPage className="home-page">
      {shouldUseCanvas() ? <CanvasBackground /> : <DivBackground />}
      <IonContent ref={contentRef} className="ion-content-transparent">
        <div className="container">
          {!isMinimized && (
            <div>
              <div className="color-type-segment">
                <LiquidGlassSegment 
                  value={colorType}
                  onSelectionChange={handleColorTypeChange}
                />
              </div>
              
              <animated.div className="color-cards" style={springProps}>
                {filteredCards.map((card) => (
                  <ColorCard
                    key={card.color} 
                    card={{
                      ...card,
                      name: card.name || card.zhName,
                      zhName: card.zhName,
                      pinyin: card.pinyin || '',
                      rgb: card.rgb || '',
                      cmyk: card.cmyk || '',
                      year: card.year || 2000
                    }} 
                    isActive={card.color === color}
                    onClick={handleCardClick}
                    getCardStyle={getCardStyle}
                  />
                ))}
              </animated.div>
              <LiquidGlassTextureTools
                texture={texture}
                onTextureChange={handleTextureChange}
              />
            </div>
          )}
          {showSaveButton && (
            <div className="save-button">
              <IonFabButton onClick={handleSetWallpaper}>
                <IonIcon icon={save} />
              </IonFabButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
