import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';
import Background from '../components/Background';
import TextureTools, { TextureType } from '../components/TextureTools';
import DevTools from '../components/DevTools';
import './Home.scss';

// 计算对比色
const getContrastColor = (hexcolor: string): string => {
  // 移除 # 号
  const hex = hexcolor.replace('#', '');
  
  // 转换为 RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 使用 YIQ 算法计算亮度
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // 亮度大于 128 时使用深色文字，否则使用浅色文字
  return yiq >= 128 ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState<'canvas' | 'div'>('div');
  const [color, setColor] = useState('#ff0000');
  const [texture, setTexture] = useState<TextureType>('solid');

  const colorCards = [
    { color: '#ff7c32', name: 'hermes' },
    { color: '#81d8d0', name: 'tiffany' },
    { color: '#cc0033', name: 'valentino' },
    { color: '#593d1c', name: 'burberry' },
    { color: '#e5e4e2', name: 'dior' },
    { color: '#fed700', name: 'fendi' },
    { color: '#b01d2e', name: 'cartier' },
    { color: '#f5f5f5', name: 'chanel' },
    { color: '#ec1d24', name: 'louboutin' },
    { color: '#eeb422', name: 'veuve' },
  ];

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 }
  });

  const handleCardClick = async (newColor: string) => {
    console.log('Setting new color:', newColor); 
    setColor(newColor);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const handleTextureChange = (newTexture: TextureType) => {
    console.log('Setting new texture:', newTexture); 
    setTexture(newTexture);
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const handleDebugChange = (newDebug: boolean) => {
    setDebug(newDebug);
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  return (
    <IonPage>
      <DevTools 
        debug={debug} 
        onDebugChange={setDebug} 
        mode={mode} 
        onModeChange={(newMode) => {
          setMode(newMode);
        }}
      >
        <Background color={color} texture={texture} debug={debug} mode={mode} />
        <IonContent className="ion-content-transparent">
          <animated.div style={fadeIn} className="card-container">
            <div className="card-grid">
              {colorCards.map((card, index) => (
                <animated.div
                  key={card.name}
                  style={{
                    ...useSpring({
                      from: { opacity: 0, transform: 'scale(0.8)' },
                      to: { opacity: 1, transform: 'scale(1)' },
                      delay: 200 + index * 100,
                    }),
                    color: getContrastColor(card.color),
                    backgroundColor: card.color,
                  }}
                  className={`color-card color-card--${card.name}`}
                  onClick={() => handleCardClick(card.color)}
                >
                  <h3 className="color-card__title">
                    {t(`colors.${card.name}.title`)}
                  </h3>
                  <p className="color-card__brand">
                    {t(`colors.${card.name}.brand`)}
                  </p>
                  <p className="color-card__value">{card.color}</p>
                </animated.div>
              ))}
            </div>
          </animated.div>
        </IonContent>
        <TextureTools color={color} onColorChange={setColor} texture={texture} onTextureChange={setTexture} />
      </DevTools>
    </IonPage>
  );
};

export default Home;
