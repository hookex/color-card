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
    config: { ...config.stiff, clamp: true }
  }));

  const bind = useDrag(({ movement: [mx], direction: [dx], velocity: [vx], last }) => {
    if (last) {
      const shouldHide = vx > 0.5 || (mx > 50 && dx > 0);
      const shouldShow = vx < -0.3 || (mx < -30 && dx < 0);

      if (shouldHide && !hideColorCard) {
        setHideColorCard(true);
        api.start({ x: window.innerWidth });
      } else if (shouldShow && hideColorCard) {
        setHideColorCard(false);
        api.start({ x: 0 });
      } else {
        api.start({
          x: hideColorCard ? window.innerWidth : 0,
          config: { tension: 200, friction: 20 }
        });
      }
    } else {
      const currentX = hideColorCard ? window.innerWidth + mx : mx;
      api.start({
        x: currentX,
        immediate: true
      });
    }
  }, {
    bounds: { left: 0, right: window.innerWidth },
    rubberband: true,
    axis: 'x',
    from: () => [x.get(), 0]
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

        <div className="container">
          {/* 色卡列表 - 可滑动 */}
          <animated.div
            className="color-cards"
            {...bind()}
            style={{
              x,
              position: 'relative',
              zIndex: debug ? 0 : 1, // 在调试模式下降低层级
              touchAction: 'none',
              pointerEvents: debug ? 'none' : 'auto' // 在调试模式下禁用指针事件
            }}
          >
              {colorCards.map((card) => (
                <ColorCard
                  key={card.color}
                  card={card}
                  isActive={color === card.color}
                  onClick={handleCardClick}
                  getCardStyle={getCardStyle}
                />
              ))}
          </animated.div>

          {/* 工具栏 - 固定不动 */}
          <TextureTools
            color={color}
            onColorChange={updateColor}
            texture={texture}
            onTextureChange={handleTextureChange}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
