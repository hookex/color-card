import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';
import CanvasBackground from '../components/CanvasBackground';
import DivBackground from '../components/DivBackground';
import TextureTools, { TextureType } from '../components/TextureTools';
import DevTools from '../components/DevTools';
import useStore from '../stores/useStore';
import { getContrastColor } from '../utils/backgroundUtils';
import createLogger from '../utils/logger';
import './Home.scss';
import '../styles/components/ColorCard.scss';

const logger = createLogger('home');

const Home: React.FC = () => {
  const { t } = useTranslation();
  const {
    color,
    texture,
    mode,
    colorCards,
    hideColorCard,
    setColor: updateColor,
    setTexture: updateTexture,
    setHideColorCard,
  } = useStore();

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  const [{ x }, api] = useSpring(() => ({ 
    x: 0,
    config: { ...config.stiff, clamp: true }
  }));

  const bind = useDrag(({ movement: [mx], direction: [dx], velocity: [vx], last }) => {
    if (last) {
      const shouldHide = vx > 0.5 || (mx > 50 && dx > 0);
      const shouldShow = vx < -0.5 || (mx < -50 && dx < 0);
      
      if (shouldHide && !hideColorCard) {
        setHideColorCard(true);
        api.start({ x: window.innerWidth });
      } else if (shouldShow && hideColorCard) {
        setHideColorCard(false);
        api.start({ x: 0 });
      } else {
        api.start({ x: hideColorCard ? window.innerWidth : 0 });
      }
    } else {
      api.start({ x: hideColorCard ? window.innerWidth + mx : mx });
    }
  }, {
    bounds: { left: 0, right: window.innerWidth },
    rubberband: true,
    axis: 'x',
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

  const splitColors = () => {
    const midPoint = Math.ceil(colorCards.length / 2);
    return {
      leftColumn: colorCards.slice(0, midPoint),
      rightColumn: colorCards.slice(midPoint)
    };
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        {mode === 'canvas' ? <CanvasBackground /> : <DivBackground />}
        
        <animated.div 
          {...bind()}
          style={{
            x,
            position: 'relative',
            zIndex: 1,
            touchAction: 'none'
          }} 
          className="container"
        >
          <div className="color-columns-container">
            <div className="color-column left-column">
              {splitColors().leftColumn.map((card) => (
                <div
                  key={card.color}
                  className={`color-card ${color === card.color ? 'active' : ''}`}
                  style={getCardStyle(card.color)}
                  onClick={() => handleCardClick(card.color)}
                >
                  <div className="color-info">
                    <div className="zh-name">{card.zhName}</div>
                    <div className="description">{card.description}</div>
                    <div className="year">{card.year}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="color-column right-column">
              {splitColors().rightColumn.map((card) => (
                <div
                  key={card.color}
                  className={`color-card ${color === card.color ? 'active' : ''}`}
                  style={getCardStyle(card.color)}
                  onClick={() => handleCardClick(card.color)}
                >
                  <div className="color-info">
                    <div className="zh-name">{card.zhName}</div>
                    <div className="description">{card.description}</div>
                    <div className="year">{card.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TextureTools
            color={color}
            onColorChange={updateColor}
            texture={texture}
            onTextureChange={handleTextureChange}
          />
          <DevTools />
        </animated.div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
