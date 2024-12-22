import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';
import Background from '../components/Background';
import TextureTools, { TextureType } from '../components/TextureTools';
import DevTools from '../components/DevTools';
import { colorCards } from '../config/brandColors';
import './Home.scss';
import '../styles/components/ColorCard.scss';

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
  const [color, setColor] = useState(colorCards[0].color);
  const [texture, setTexture] = useState<TextureType>('solid');

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
      <DevTools 
        debug={debug} 
        onDebugChange={setDebug} 
        mode={mode} 
        onModeChange={(newMode) => {
          setMode(newMode);
        }}
      >
        <Background color={color} texture={texture} debug={debug} mode={mode} />
        <IonContent>
          <animated.div style={fadeIn}>
            <div className="color-cards">
              <div className="color-column">
                {splitColors().leftColumn.map(({ color, name, zhName, year }) => (
                  <div
                    key={name}
                    className="color-card"
                    style={getCardStyle(color)}
                    onClick={() => handleCardClick(color)}
                  >
                    <div className="year-label">{year}</div>
                    <div className="card-info">
                      <div className="en-name">{name}</div>
                      <div className="zh-name">{zhName}</div>
                      <div className="rgb">{color.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="color-column">
                {splitColors().rightColumn.map(({ color, name, zhName, year }) => (
                  <div
                    key={name}
                    className="color-card"
                    style={getCardStyle(color)}
                    onClick={() => handleCardClick(color)}
                  >
                    <div className="year-label">{year}</div>
                    <div className="card-info">
                      <div className="en-name">{name}</div>
                      <div className="zh-name">{zhName}</div>
                      <div className="rgb">{color.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </animated.div>
        </IonContent>
        <TextureTools
          color={color}
          onColorChange={setColor}
          texture={texture}
          onTextureChange={handleTextureChange}
        />
      </DevTools>
    </IonPage>
  );
};

export default Home;
