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

  const [{ x }, api] = useSpring(() => ({
    x: 0,
    config: { ...config.stiff }
  }));

  const bind = useDrag(({ active, movement: [mx], last }) => {
    if (active) {
      api.start({ x: mx, immediate: true });
    } else if (last) {
      api.start({ x: 0, config: { tension: 200, friction: 20 } });
    }
  }, {
    axis: 'x',
    filterTaps: true,
    bounds: { left: -100, right: 100 }
  });

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
      <IonContent fullscreen>
        <div className={`canvas-container ${debug ? 'debug-mode' : ''}`}>
          {mode === 'canvas' ? <CanvasBackground /> : <DivBackground />}
        </div>

        <animated.div 
          className="container"
          {...bind()}
          style={{
            touchAction: 'none',
            transform: x.to(value => `translateX(${value}px)`)
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
