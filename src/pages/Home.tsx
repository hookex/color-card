import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';
import useStore  from '../stores/useStore';
import CanvasBackground from '../components/CanvasBackground';
import DivBackground from '../components/DivBackground';
import TextureTools from '../components/TextureTools';
import ColorCard from '../components/ColorCard';
import { getContrastColor } from '../utils/backgroundUtils';
import createLogger from '../utils/logger';
import { useState, useEffect } from 'react';
import './Home.scss';

const logger = createLogger('home');

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

  const bind = useDrag(({ active, movement: [mx], offset: [ox], last, velocity: [vx], direction: [dx] }) => {
    const threshold = window.innerWidth * 0.15; // Increased threshold for swipe back
    const velocityThreshold = 0.3; // Increased velocity threshold for swipe back
    const shouldSlideOut = Math.abs(ox) > threshold;
    
    if (active) {
      console.log('Dragging:', { ox });
      api.start({ 
        x: ox,
        immediate: true,
      });
    } else if (last) {
      const isSliding = Math.abs(vx) > velocityThreshold;
      const direction = dx > 0 ? 1 : -1; // Determine direction based on swipe
      let targetX = direction > 0 ? window.innerWidth : 0; // Swipe out if direction is positive, otherwise swipe in

      // Record swipe state at the end
      setIsSwipedOut(targetX !== 0);

      console.log('Swipe End:', { vx, direction, targetX, swipeDirection: targetX === 0 ? 'Swipe Back' : 'Swipe Out' });
      
      api.start({ 
        x: targetX,
        config: {
          mass: 1,
          tension: 300, // Increased tension for faster response
          friction: 50, // Increased friction to dampen the bounce
        },
        onRest: () => {
          if (Math.abs(targetX) === window.innerWidth) {
            console.log('Swipe completed to:', targetX);
          }
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
      </IonContent>
    </IonPage>
  );
};

export default Home;
