import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';
import Background from '../components/Background';
import TextureTools, { TextureType } from '../components/TextureTools';
import './Home.scss';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [bgColor, setBgColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor') || '#f5f5f5';
    return savedColor;
  });

  const [texture, setTexture] = useState<TextureType>(() => {
    const savedTexture = localStorage.getItem('selectedTexture') as TextureType || 'solid';
    return savedTexture;
  });

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

  useEffect(() => {
    localStorage.setItem('selectedColor', bgColor);
  }, [bgColor]);

  useEffect(() => {
    localStorage.setItem('selectedTexture', texture);
  }, [texture]);

  const handleCardClick = async (color: string) => {
    setBgColor(color);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const handleTextureChange = (newTexture: TextureType) => {
    setTexture(newTexture);
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  return (
    <IonPage>
      <div className="flex-1">
        <Background color={bgColor} texture={texture} />
        <IonContent className="ion-content-transparent">
          <animated.div style={fadeIn} className="card-container">
            <div className="card-grid">
              {colorCards.map((card, index) => (
                <animated.div
                  key={card.name}
                  style={useSpring({
                    from: { opacity: 0, transform: 'scale(0.8)' },
                    to: { opacity: 1, transform: 'scale(1)' },
                    delay: 200 + index * 100,
                  })}
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
        <TextureTools
          currentTexture={texture}
          onTextureChange={handleTextureChange}
        />
      </div>
    </IonPage>
  );
};

export default Home;
