import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
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
    setColor: updateColor,
    setTexture: updateTexture,
  } = useStore();

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
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
      <IonContent fullscreen scrollY={false}>
        {mode === 'canvas' ? (
          <CanvasBackground />
        ) : (
          <DivBackground />
        )}
        <animated.div style={fadeIn} className="container">
          <div className="color-grid">
            <div className="column">
              {splitColors().leftColumn.map((card) => (
                <div
                  key={card.color}
                  className={`color-card ${color === card.color ? 'active' : ''}`}
                  style={getCardStyle(card.color)}
                  onClick={() => handleCardClick(card.color)}
                >
                  <div className="color-info">
                    <div className="zh-name">{card.zhName}</div>
                    <div className="pinyin">{card.pinyin}</div>
                    <div className="year">{card.year}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="column">
              {splitColors().rightColumn.map((card) => (
                <div
                  key={card.color}
                  className={`color-card ${color === card.color ? 'active' : ''}`}
                  style={getCardStyle(card.color)}
                  onClick={() => handleCardClick(card.color)}
                >
                  <div className="color-info">
                    <div className="zh-name">{card.zhName}</div>
                    <div className="pinyin">{card.pinyin}</div>
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
