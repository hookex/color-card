import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const Home: React.FC = () => {
  const [bgColor, setBgColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor');
    return savedColor || '#f3f4f6';
  });

  const colorCards = [
    { color: '#ef4444', name: 'Red' },
    { color: '#3b82f6', name: 'Blue' },
    { color: '#22c55e', name: 'Green' },
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
    from: { backgroundColor: '#f3f4f6' }, // gray-100
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
          <animated.div style={fadeIn} className="p-4 h-full flex items-center">
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              {colorCards.map((card, index) => (
                <animated.div
                  key={card.name}
                  style={{
                    ...useSpring({
                      from: { opacity: 0, transform: 'scale(0.8)' },
                      to: { opacity: 1, transform: 'scale(1)' },
                      delay: 200 + index * 100,
                    }),
                    backgroundColor: card.color,
                  }}
                  className="rounded-lg shadow-lg p-6 cursor-pointer 
                    transform transition-transform hover:scale-105 active:scale-95"
                  onClick={() => handleCardClick(card.color)}
                >
                  <h3 className="text-white font-semibold text-xl">{card.name}</h3>
                  <p className="text-white opacity-80 mt-2">{card.color}</p>
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
