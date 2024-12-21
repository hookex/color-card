import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';
import './Home.css';

const Home: React.FC = () => {
  const [bgColor, setBgColor] = useState('bg-gray-100');

  const colorCards = [
    { color: 'bg-red-500', name: 'Red', value: '#ef4444' },
    { color: 'bg-blue-500', name: 'Blue', value: '#3b82f6' },
    { color: 'bg-green-500', name: 'Green', value: '#22c55e' },
  ];

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 }
  });

  const handleCardClick = (color: string) => {
    setBgColor(color);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-2xl font-bold">ColorCard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className={`${bgColor} transition-colors duration-500`}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" className="text-3xl font-bold">ColorCard</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <animated.div style={fadeIn} className="p-4">
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            {colorCards.map((card, index) => (
              <animated.div
                key={card.name}
                style={useSpring({
                  from: { opacity: 0, transform: 'scale(0.8)' },
                  to: { opacity: 1, transform: 'scale(1)' },
                  delay: 200 + index * 100,
                })}
                className={`${card.color} rounded-lg shadow-lg p-6 cursor-pointer 
                  transform transition-transform hover:scale-105 active:scale-95`}
                onClick={() => handleCardClick(card.color)}
              >
                <h3 className="text-white font-semibold text-xl">{card.name}</h3>
                <p className="text-white opacity-80 mt-2">{card.value}</p>
              </animated.div>
            ))}
          </div>
        </animated.div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
