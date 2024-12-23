import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonFabButton, IonIcon, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
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

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const dragWidth = width * 0.3;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleColorTypeChange = (type: ColorType) => {
    setColorType(type);
    try {
      Haptics.impact({ style: ImpactStyle.Light });
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

  return (
    <IonPage className="home-page">
      {mode === 'canvas' ? <CanvasBackground /> : <DivBackground />}
      <IonContent className="ion-content-transparent">
        <div className="container">
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
          <div className="color-cards">
            {getColorCards().map((card) => (
              <ColorCard
                key={card.color}
                card={card}
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
        {showSaveButton && (
          <div className="save-button">
            <IonFabButton onClick={handleSetWallpaper}>
              <IonIcon icon={save} />
            </IonFabButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
