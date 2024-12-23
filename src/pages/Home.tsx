import React, { useEffect, useState, useRef } from 'react';
import { IonContent, IonPage, IonFabButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, createGesture } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { save } from 'ionicons/icons';
import useStore, { ColorType } from '../stores/useStore';
import ColorCard from '../components/ColorCard';
import TextureTools from '../components/TextureTools';
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

const Home: React.FC = () => {
  const { t } = useTranslation();
  const logger = createLogger('Home');
  const contentRef = useRef<HTMLIonContentElement>(null);

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
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'reset'>('reset');
  const [isMinimized, setIsMinimized] = useState(false);

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
        const velocity = detail.velocityX;
        const deltaX = detail.deltaX;
        
        if (Math.abs(velocity) > 0.2 && Math.abs(deltaX) > 50) {
          const colorTypes: ColorType[] = ['brand', 'chinese', 'nature', 'food', 'mood', 'space'];
          const currentIndex = colorTypes.indexOf(colorType);
          
          if (velocity < 0 && currentIndex < colorTypes.length - 1) {
            // Swipe left - go to next
            handleColorTypeChange(colorTypes[currentIndex + 1]);
          } else if (velocity > 0 && currentIndex > 0) {
            // Swipe right - go to previous
            handleColorTypeChange(colorTypes[currentIndex - 1]);
          }
        }
      }
    });

    gesture.enable();
    return () => gesture.destroy();
  }, [colorType]);

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
      if (mode === 'canvas') {
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
      const result = await takeScreenshot(currentMode);
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
      const result = await takeScreenshot(currentMode);
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
    if (!newType) return;
    
    const colorTypes: ColorType[] = ['brand', 'chinese', 'nature', 'food', 'mood', 'space'];
    const currentIndex = colorTypes.indexOf(colorType);
    const newIndex = colorTypes.indexOf(newType);
    
    // Determine slide direction based on index change
    const direction = newIndex > currentIndex ? 'left' : 'right';
    setSlideDirection(direction);
    
    // Reset the slide after animation
    setTimeout(() => {
      setColorType(newType);
      setSlideDirection('reset');
    }, 300); // Match this with the CSS transition duration
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      logger.error('Haptics not available:', error);
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
    const hasRequiredProps = card.name && card.zhName && card.description;
    return hasRequiredProps && 
      (colorType === 'brand' || 
       colorType === 'nature' || 
       colorType === 'food' || 
       colorType === 'mood' || 
       colorType === 'space' || 
       card.zhName.includes(colorType) || 
       card.description.includes(colorType));
  });

  return (
    <IonPage className="home-page">
      {mode === 'canvas' ? <CanvasBackground /> : <DivBackground />}
      <IonContent ref={contentRef} className="ion-content-transparent">
        <div className="container">
          {!isMinimized && (
            <div>
              <div className="color-type-segment">
                <IonSegment value={colorType} onIonChange={e => handleColorTypeChange(e.detail.value as ColorType)} scrollable>
                  <IonSegmentButton value="brand">
                    <IonLabel>品牌色</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="chinese">
                    <IonLabel>中国色</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="nature">
                    <IonLabel>自然色</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="food">
                    <IonLabel>美食色</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="mood">
                    <IonLabel>心情色</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="space">
                    <IonLabel>太空色</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </div>
              <div className={`color-cards slide-${slideDirection}`}>
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
              </div>
              <TextureTools
                color={color}
                onColorChange={updateColor}
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
