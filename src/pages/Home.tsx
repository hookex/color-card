import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';
import Background from '../components/Background';
import TextureTools, { TextureType } from '../components/TextureTools';
import useStore from '../stores/useStore';
import { getContrastColor } from '../utils/backgroundUtils';
import './Home.scss';
import '../styles/components/ColorCard.scss';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'canvas' | 'div'>('div');
  
  // 分开订阅 store 状态
  const color = useStore(state => state.color);
  const texture = useStore(state => state.texture);
  const debug = useStore(state => state.debug);
  const colorCards = useStore(state => state.colorCards);
  const updateColor = useStore(state => state.setColor);
  const updateTexture = useStore(state => state.setTexture);
  const updateDebug = useStore(state => state.setDebug);

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 }
  });

  const handleCardClick = async (newColor: string) => {
    console.log('Setting new color:', newColor); 
    updateColor(newColor);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const handleTextureChange = async (newTexture: TextureType) => {
    console.log('Setting new texture:', newTexture); 
    updateTexture(newTexture);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const handleDebugChange = async (newDebug: boolean) => {
    updateDebug(newDebug);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
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
        <Background color={color} texture={texture} mode={mode} debug={debug} />
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
        </animated.div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
