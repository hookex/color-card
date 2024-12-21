import { IonContent, IonPage } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';
import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import './Home.scss';

const Home: React.FC = () => {
  const [bgColor, setBgColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor') || '#f5f5f5';
    return savedColor;
  });

  const colorCards = [
    { color: '#ff7c32', name: 'hermes', brand: 'Hermès', title: '爱马仕橙' },
    { color: '#81d8d0', name: 'tiffany', brand: 'Tiffany & Co.', title: '蒂芙尼蓝' },
    { color: '#cc0033', name: 'valentino', brand: 'Valentino', title: '华伦天奴红' },
    { color: '#593d1c', name: 'burberry', brand: 'Burberry', title: '巴宝莉棕' },
    { color: '#e5e4e2', name: 'dior', brand: 'Christian Dior', title: '迪奥灰' },
    { color: '#fed700', name: 'fendi', brand: 'Fendi', title: '芬迪黄' },
    { color: '#b01d2e', name: 'cartier', brand: 'Cartier', title: '卡地亚红' },
    { color: '#f5f5f5', name: 'chanel', brand: 'Chanel', title: '香奈儿白' },
    { color: '#ec1d24', name: 'louboutin', brand: 'Christian Louboutin', title: '鲁布托红底' },
    { color: '#eeb422', name: 'veuve', brand: 'Veuve Clicquot', title: '凯歌香槟金' },
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
                  <h3 className="color-card__title">{card.title}</h3>
                  <p className="color-card__brand">{card.brand}</p>
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
