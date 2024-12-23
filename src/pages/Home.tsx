import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonFabButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { save } from 'ionicons/icons';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import useStore from '../stores/useStore';
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

const Home: React.FC = () => {
  const { t } = useTranslation();
  const logger = createLogger('Home');

  const {
    color,
    texture,
    debug,
    mode,
    colorCards,
    hideColorCard,
    setColor: updateColor,
    setTexture: updateTexture,
    setMode,
    setHideColorCard,
  } = useStore();

  const [showSaveButton, setShowSaveButton] = useState(false);

  const [bounds, setBounds] = useState(() => {
    const width = window.innerWidth;
    const dragWidth = width * 0.2;
    return { left: -dragWidth, right: dragWidth };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const dragWidth = width * 0.3;
      setBounds({ left: -dragWidth, right: dragWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [{ x }, api] = useSpring(() => ({
    x: hideColorCard ? -window.innerWidth : 0,
    config: {
      mass: 1,
      tension: 200,
      friction: 20,
    }
  }));

  const [isSwipedOut, setIsSwipedOut] = useState(false);

  const buttonAnimation = useSpring({
    opacity: isSwipedOut ? 1 : 0,
    y: isSwipedOut ? 0 : 20,
    scale: isSwipedOut ? 1 : 0.9,
    transform: `translate(-50%, ${isSwipedOut ? 0 : 20}px) scale(${isSwipedOut ? 1 : 0.9})`,
    pointerEvents: isSwipedOut ? 'auto' : 'none',
    config: {
      mass: 0.5,
      tension: 280,
      friction: 24,
      clamp: false,
      duration: undefined
    }
  });

  const threshold = 200;
  const velocityThreshold = 0.3;

  const bind = useDrag(
    ({ down, movement: [mx], last, velocity: [vx], direction: [dx] }) => {
      const ox = mx;
      if (down) {
        api.start({
          x: ox,
          immediate: true,
        });
        setIsSwipedOut(ox < -threshold);
      } else if (last) {
        const isSliding = Math.abs(vx) > velocityThreshold;
        const direction = dx < 0 ? 1 : -1;
        const shouldSlideOut = isSliding ? direction > 0 : Math.abs(ox) > threshold;
        const targetX = shouldSlideOut ? -window.innerWidth : 0;

        setIsSwipedOut(shouldSlideOut);

        api.start({
          x: targetX,
          immediate: false,
          config: {
            duration: isSliding ? 400 : 800,
          },
        } as const);
      }
    },
    {
      axis: 'x',
      bounds: { left: -window.innerWidth, right: 0 },
      rubberband: true,
    }
  );

  useEffect(() => {
    if (x.get() < -50) {
      setShowSaveButton(true);
    } else {
      setShowSaveButton(false);
    }
  }, [x.get()]);

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

  return (
    <IonPage className="home-page">
      {mode === 'canvas' ? <CanvasBackground /> : <DivBackground />}
      <IonContent className="ion-content-transparent">
        <animated.div
          {...bind()}
          className="container"
          style={{
            x,
            touchAction: 'none',
          }}
        >
          <div className="color-cards">
            {colorCards.map((card) => (
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
        </animated.div>
        {showSaveButton && (
          <animated.div style={buttonAnimation} className="save-button">
            <IonFabButton onClick={handleSetWallpaper}>
              <IonIcon icon={save} />
            </IonFabButton>
          </animated.div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
