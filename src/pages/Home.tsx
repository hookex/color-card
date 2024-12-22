import React, { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { IonContent, IonPage, IonFabButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { save } from 'ionicons/icons';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import useStore from '../stores/useStore';
import ColorCard from '../components/ColorCard';
import TextureTools from '../components/TextureTools';
import { takeScreenshot } from '../utils/screenshot';
import createLogger  from '../utils/logger';
import CanvasBackground from '../components/CanvasBackground';
import DivBackground from '../components/DivBackground';
import { getContrastColor, getGlassOpacity } from '../utils/backgroundUtils';
import './Home.scss';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';
import { TextureType } from '../components/TextureTools';

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
    hasCompletedTutorial,
    setHasCompletedTutorial,
  } = useStore();

  const [runTutorial, setRunTutorial] = useState(!hasCompletedTutorial);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSaveButton, setShowSaveButton] = useState(false);

  const steps: Step[] = [
    {
      target: '.color-card',
      content: '点击选择你喜欢的颜色',
      placement: 'bottom',
    },
    {
      target: '.glass-toolbar',
      content: '选择不同的材质效果',
      placement: 'top',
    },
    {
      target: '.home-page',
      content: '向左滑动来预览壁纸',
      placement: 'center',
      spotlightClicks: true,
      disableBeacon: true,
      disableOverlay: true,
      floaterProps: {
        disableAnimation: true,
      },
    },
    {
      target: '.save-button',
      content: '点击保存按钮',
      placement: 'center',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.wallpaper-button',
      content: '点击保存，进入相册，设置为壁纸',
      placement: 'top',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (["finished", "skipped"].includes(status)) {
      setHasCompletedTutorial(true);
      setRunTutorial(false);
      
      // 引导完成后，回到色卡列表
      api.start({
        x: 0,
        immediate: false,
        config: {
          duration: 500,
        },
      } as const);
      setIsSwipedOut(false);
      return;
    }

    // 处理下一步按钮点击
    if (type === 'step:after' && action === 'next') {
      setCurrentStep(prev => prev + 1);
    }
  };

  const [bounds, setBounds] = useState(() => {
    const width = window.innerWidth;
    const dragWidth = width * 0.2; // 40vw
    return { left: -dragWidth, right: dragWidth };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const dragWidth = width * 0.3; // 40vw
      setBounds({ left: -dragWidth, right: dragWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [{ x }, api] = useSpring(() => ({
    x: hideColorCard ? -window.innerWidth : 0,  // 根据初始状态设置位置
    config: {
      mass: 1,
      tension: 200,
      friction: 20,
    }
  }));

  const [isSwipedOut, setIsSwipedOut] = useState(false);

  const buttonAnimation = useSpring({
    opacity: isSwipedOut ? 1 : 0,
    y: isSwipedOut ? 0 : 20,
    scale: isSwipedOut ? 1 : 0.9,
    transform: `translate(-50%, ${isSwipedOut ? 0 : 20}px) scale(${isSwipedOut ? 1 : 0.9})`,
    pointerEvents: isSwipedOut ? 'auto' : 'none',
    config: {
      mass: 0.5,
      tension: 280,
      friction: 24,
      clamp: false,
      duration: undefined
    }
  });

  const threshold = 200;
  const velocityThreshold = 0.3;

  const [shouldShowNext, setShouldShowNext] = useState(false);

  useEffect(() => {
    if (currentStep === 3) {
      const checkButtonVisibility = () => {
        const saveButton = document.querySelector('.save-button');
        if (saveButton && window.getComputedStyle(saveButton).display !== 'none') {
          setShouldShowNext(true);
        } else {
          setShouldShowNext(false);
        }
      };

      checkButtonVisibility();

      const interval = setInterval(checkButtonVisibility, 100);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const bind = useDrag(
    ({ down, movement: [mx], last, velocity: [vx], direction: [dx] }) => {
      const ox = mx;
      if (down) {
        api.start({
          x: ox,
          immediate: true,
        });
        setIsSwipedOut(ox < -threshold);
        
        if (currentStep === 2 && ox < -100) {
          setCurrentStep(3);
        }
      } else if (last) {
        const isSliding = Math.abs(vx) > velocityThreshold;
        const direction = dx < 0 ? 1 : -1;
        const shouldSlideOut = isSliding ? direction > 0 : Math.abs(ox) > threshold;
        const targetX = shouldSlideOut ? -window.innerWidth : 0;

        setIsSwipedOut(shouldSlideOut);
        
        if (currentStep === 2 && shouldSlideOut) {
          setCurrentStep(3);
        }

        api.start({
          x: targetX,
          immediate: false,
          config: {
            duration: isSliding ? 400 : 800,
          },
        } as const);
      }
    },
    {
      axis: 'x',
      bounds: { left: -window.innerWidth, right: 0 },
      rubberband: true,
    }
  );

  useEffect(() => {
    if (x.get() < -50) {
      setShowSaveButton(true);
    } else {
      setShowSaveButton(false);
    }
  }, [x.get()]);

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

  const currentMode = useStore(state => state.mode);

  const handleSave = async () => {
    try {
      if (mode === 'canvas') {
        await handleCanvasSave();
      } else {
        await handleDivSave();
      }
      // 保存成功后，如果当前是第4步，进入第5步
      if (currentStep === 3) {
        setTimeout(() => {
          setCurrentStep(4);
        }, 500);
      }
    } catch (error) {
      logger.error('Error saving:', error);
    }
  };

  const handleCanvasSave = async () => {
    try {
      const result = await takeScreenshot(currentMode);
      if (result.success) {
        console.log('Wallpaper saved:', result.fileName);
      } else {
        console.error('Failed to save wallpaper:', result.error);
      }
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  };

  const handleDivSave = async () => {
    try {
      const result = await takeScreenshot(currentMode);
      if (result.success) {
        console.log('Wallpaper saved:', result.fileName);
      } else {
        console.error('Failed to save wallpaper:', result.error);
      }
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  };

  const handleSetWallpaper = async () => {
    try {
      await handleSave();
    } catch (error) {
      console.error('Failed to set wallpaper:', error);
    }
  };

  return (
    <IonPage className="home-page">
      <Joyride
        steps={steps}
        run={runTutorial}
        stepIndex={currentStep}
        continuous
        showSkipButton
        showProgress
        disableScrollParentFix
        disableCloseOnEsc
        styles={{
          options: {
            arrowColor: 'rgba(255, 255, 255, 0.7)',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
          overlay: {
            pointerEvents: currentStep === 2 ? 'none' : 'auto',
          },
          spotlight: {
            backgroundColor: 'transparent',
          },
        }}
        floaterProps={{
          disableAnimation: true,
          styles: {
            arrow: {
              length: 8,
              spread: 12,
            },
            floater: {
              filter: 'none'
            }
          },
        }}
        locale={{
          back: '上一步',
          close: '关闭',
          last: '完成',
          next: '下一步',
          skip: '跳过',
        }}
        callback={handleJoyrideCallback}
      />
      <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
      </div>
      <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
        {mode === 'canvas' ? (
          <CanvasBackground />
        ) : (
          <DivBackground />
        )}
      </div>
      <IonContent fullscreen {...bind()} style={{ touchAction: 'none', position: 'relative', zIndex: 1 }}>
        <animated.div 
          className="container"
          style={{
            transform: x.to(value => `translateX(${value}px)`),
            visibility: x.to(value => 
              Math.abs(value) >= window.innerWidth ? 'hidden' : 'visible'
            )
          }}
        >
          {/* 色卡列表 */}
          <div 
            className="color-cards"
            style={{
              position: 'relative',
              pointerEvents: debug ? 'none' : 'auto'
            }}
          >
            {colorCards.map((card) => (
              <ColorCard
                key={card.color}
                card={{...card, year: card.year.toString()}}
                isActive={color === card.color}
                onClick={handleCardClick}
                getCardStyle={getCardStyle}
              />
            ))}
          </div>

          {/* 纹理工具 */}
          <TextureTools
            color={color}
            onColorChange={updateColor}
            texture={texture}
            onTextureChange={handleTextureChange}
          />
        </animated.div>

        {/* 保存按钮 */}
        <animated.div
          className={`save-button ${isSwipedOut ? 'active' : ''}`}
          style={{
            transform: x.to(x => `translate3d(${x}px, 0, 0)`),
          }}
          onClick={handleSave}
        >
          <IonFabButton>
            <IonIcon icon={save} />
          </IonFabButton>
        </animated.div>

        <animated.div 
          className="wallpaper-button-container"
          style={buttonAnimation as any}
        >
          <div 
            className="glass-button" 
            style={{ 
              '--glass-opacity': getGlassOpacity(color),
            } as any}
          >
            <IonFabButton 
              className="wallpaper-button" 
              onClick={handleSetWallpaper}
            >
              <IonIcon icon={save} />
            </IonFabButton>
          </div>
          <div className="button-label">{t('home.save')}</div>
        </animated.div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
