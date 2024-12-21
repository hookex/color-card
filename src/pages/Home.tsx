import { IonContent, IonPage, IonButton } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';
import './Home.scss';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [bgColor, setBgColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor') || '#f5f5f5';
    return savedColor;
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

  const handleCardClick = async (color: string) => {
    setBgColor(color);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const [springProps, api] = useSpring(() => ({
    from: { backgroundColor: '#f5f5f5' },
  }));

  useEffect(() => {
    api.start({
      to: {
        backgroundColor: bgColor,
      },
      config: { tension: 200, friction: 20 },
    });
  }, [bgColor, api]);

  return (
    <IonPage>
      <animated.div style={springProps} className="flex-1">
        <IonContent className="ion-content-transparent">
          <div className="absolute top-4 right-4 z-10">
            <IonButton
              fill="clear"
              onClick={toggleLanguage}
              className="font-semibold"
            >
              {i18n.language === 'en' ? '中文' : 'EN'}
            </IonButton>
          </div>
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
      </animated.div>
    </IonPage>
  );
};

export default Home;
