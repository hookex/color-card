import React from 'react';
import { useTranslation } from 'react-i18next';
import { IonContent, IonPage, IonFabButton, IonIcon } from '@ionic/react';
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
import { getContrastColor } from '../utils/backgroundUtils';
import { useState, useEffect } from 'react';
import './Home.scss';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';


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

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  const [bounds, setBounds] = useState(() => {
    const width = window.innerWidth;
    const dragWidth = width * 0.2; // 40vw
    return { left: -dragWidth, right: dragWidth };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const dragWidth = width * 0.3; // 40vw
      setBounds({ left: -dragWidth, right: dragWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [{ x }, api] = useSpring(() => ({
    x: hideColorCard ? -window.innerWidth : 0,  // 根据初始状态设置位置
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

  const bind = useDrag(({ active, movement: [mx], offset: [ox], last, velocity: [vx], direction: [dx] }) => {
    const threshold = window.innerWidth * 0.15;
    const velocityThreshold = 0.3;
    
    if (active) {
      api.start({ 
        x: ox,
        immediate: true,
      });
      setIsSwipedOut(ox > threshold);
    } else if (last) {
      const isSliding = Math.abs(vx) > velocityThreshold;
      const direction = dx > 0 ? 1 : -1;
      const shouldSlideOut = isSliding ? direction > 0 : Math.abs(ox) > threshold;
      const targetX = shouldSlideOut ? window.innerWidth : 0;

      setIsSwipedOut(shouldSlideOut);
      
      api.start({ 
        x: targetX,
        config: {
          mass: 1,
          tension: 300,
          friction: 50,
        }
      });
    }
  }, {
    axis: 'x',
    filterTaps: true,
    bounds: { left: -window.innerWidth, right: window.innerWidth },
    threshold: 5,
    rubberband: true,
    from: () => [x.get(), 0],
    preventScroll: true,
    triggerAllEvents: true,
    pointer: { touch: true },
  });

  useEffect(() => {
    const handleResize = () => {
      if (hideColorCard) {
        const direction = x.get() > 0 ? 1 : -1;
        api.start({ x: direction * window.innerWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hideColorCard]);

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

  const handleSetWallpaper = async () => {
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

  return (
    <IonPage>
      <IonContent fullscreen {...bind()} style={{ touchAction: 'none' }}>
        <div className={`canvas-container ${debug ? 'debug-mode' : ''}`}>
          {mode === 'canvas' ? <CanvasBackground /> : <DivBackground />}
        </div>

        <animated.div 
          className="container"
          style={{
            transform: x.to(value => `translateX(${value}px)`),
            visibility: x.to(value => 
              Math.abs(value) >= window.innerWidth ? 'hidden' : 'visible'
            ),
          }}
        >
          {/* 色卡列表 */}
          <div
            className="color-cards"
            style={{
              position: 'relative',
              zIndex: debug ? 0 : 1,
              pointerEvents: debug ? 'none' : 'auto'
            }}
          >
              {colorCards.map((card) => (
                <ColorCard
                  key={card.color}
                  card={{...card, year: card.year.toString()}}
                  isActive={color === card.color}
                  onClick={handleCardClick}
                  getCardStyle={getCardStyle}
                />
              ))}
          </div>

          {/* 工具栏 */}
          <TextureTools
            color={color}
            onColorChange={updateColor}
            texture={texture}
            onTextureChange={handleTextureChange}
          />
        </animated.div>

        <animated.div style={buttonAnimation} className="wallpaper-button-container glass-effect">
          <IonFabButton 
            className="wallpaper-button" 
            onClick={handleSetWallpaper}
          >
            <IonIcon icon={save} />
          </IonFabButton>
          <div className="button-label">{t('home.save')}</div>
        </animated.div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
