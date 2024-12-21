import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import './Home.scss';

const Home: React.FC = () => {
  const [bgColor, setBgColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor') || '#f3f4f6';
    return savedColor;
  });

  const colorCards = [
    { color: '#ef4444', name: 'red' },
    { color: '#3b82f6', name: 'blue' },
    { color: '#22c55e', name: 'green' },
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

  const [springProps, api] = useSpring(() => ({
    from: { backgroundColor: '#f3f4f6' },
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
        <IonContent fullscreen className="ion-content-transparent">
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
                  <h3 className="color-card__title">{card.name.toUpperCase()}</h3>
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
