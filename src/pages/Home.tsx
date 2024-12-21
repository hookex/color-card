import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import './Home.css';

const Home: React.FC = () => {
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 }
  });

  const cardSpring = useSpring({
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    delay: 300,
    config: { tension: 200, friction: 20 }
  });

  const colorCards = [
    { color: 'bg-red-500', name: 'Red' },
    { color: 'bg-blue-500', name: 'Blue' },
    { color: 'bg-green-500', name: 'Green' },
    { color: 'bg-yellow-500', name: 'Yellow' },
    { color: 'bg-purple-500', name: 'Purple' },
    { color: 'bg-pink-500', name: 'Pink' },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-2xl font-bold text-blue-600">ColorCard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="bg-gray-100">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" className="text-3xl font-bold text-blue-600">ColorCard</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <animated.div style={fadeIn} className="p-4">
          <animated.div style={cardSpring} className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to ColorCard</h2>
            <p className="text-gray-600">
              A beautiful cross-platform application built with Ionic React and Tailwind CSS.
            </p>
          </animated.div>

          <div className="grid grid-cols-2 gap-4">
            {colorCards.map((card, index) => (
              <animated.div
                key={card.name}
                style={useSpring({
                  from: { opacity: 0, transform: 'scale(0.8)' },
                  to: { opacity: 1, transform: 'scale(1)' },
                  delay: 200 + index * 100,
                })}
                className={`${card.color} rounded-lg shadow-lg p-4 cursor-pointer transform transition-transform hover:scale-105`}
              >
                <h3 className="text-white font-semibold text-lg">{card.name}</h3>
                <p className="text-white opacity-80 text-sm">Tap to select</p>
              </animated.div>
            ))}
          </div>
        </animated.div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
