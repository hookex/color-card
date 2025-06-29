import React, { useState, useEffect } from 'react';
import { 
  IonFab, 
  IonFabButton, 
  IonIcon, 
  IonFabList, 
  IonToast, 
  IonPopover,
  IonContent,
  IonLabel,
  IonButton,
  IonModal
} from '@ionic/react';
import { 
  buildOutline, 
  languageOutline, 
  cameraOutline, 
  cubeOutline, 
  layersOutline,
  brushOutline,
  squareOutline,
  refreshOutline
} from 'ionicons/icons';
import { Inspector } from 'react-dev-inspector';
import { useTranslation } from 'react-i18next';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';
import './DevTools.scss';
import createLogger from '../utils/logger';
import { saveDevToolsState, loadDevToolsState } from '../utils/storage';
import { useAppStore } from '../stores/useAppStore';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';

const logger = createLogger('devtools');
const InspectorWrapper = Inspector;

/**
 * DevTools 组件属性接口
 * @interface Props
 * @property {React.ReactNode} [children] - 子组件
 */
interface Props {
  children?: React.ReactNode;
}

const DevTools: React.FC<Props> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [showInspector, setShowInspector] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { 
    debug, 
    setDebug, 
    mode, 
    setMode, 
    resetScene, 
    hasCompletedTutorial, 
    setHasCompletedTutorial,
    texture
  } = useAppStore();

  // 初始化时加载保存的状态
  useEffect(() => {
    const savedState = loadDevToolsState();
    if (savedState) {
      // 恢复调试模式
      if (savedState.debug !== debug) {
        setDebug(savedState.debug);
      }
      // 恢复渲染模式
      if (savedState.mode !== mode) {
        setMode(savedState.mode);
      }
      // 恢复语言设置
      if (savedState.language !== i18n.language) {
        i18n.changeLanguage(savedState.language);
      }
      logger.info('Restored DevTools state:', savedState);
    }
  }, []);

  // 保存状态变化
  useEffect(() => {
    saveDevToolsState({
      debug,
      mode,
      language: i18n.language as string,
      texture
    });
  }, [debug, mode, i18n.language, texture]);

  // 显示 Toast 提示
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // 切换调试器
  const toggleInspector = () => {
    setShowInspector(!showInspector);
    showToastMessage(t(showInspector ? 'devtools.toast.inspector_off' : 'devtools.toast.inspector_on'));
  };

  // 切换语言
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(nextLang);
    showToastMessage(t('devtools.toast.language_switch', { lang: nextLang === 'zh' ? '中文' : '英文' }));
  };

  // 截图
  const takeScreenshot = async () => {
    try {
      logger.info('Taking screenshot...');
      let canvas: HTMLCanvasElement;
      
      if (mode === 'canvas') {
        // Canvas 模式：直接获取 canvas 元素
        const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
        if (!canvasElement) {
          throw new Error('Canvas element not found');
        }
        canvas = canvasElement;
      } else {
        // Div 模式：使用 html2canvas 将 div 转换为 canvas
        const backgroundDiv = document.querySelector('.background') as HTMLElement;
        if (!backgroundDiv) {
          throw new Error('Background div not found');
        }
        canvas = await html2canvas(backgroundDiv, {
          backgroundColor: null,
          scale: 2, // 提高截图质量
        });
      }

      // 创建一个临时画布
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // 设置 iPhone 壁纸尺寸
      tempCanvas.width = 1170;
      tempCanvas.height = 2532;

      // 填充背景色（可选，防止透明）
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // 计算缩放和位置以保持宽高比
      const scale = Math.max(
        tempCanvas.width / canvas.width,
        tempCanvas.height / canvas.height
      );
      
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;
      const x = (tempCanvas.width - scaledWidth) / 2;
      const y = (tempCanvas.height - scaledHeight) / 2;

      // 绘制并缩放原始画布内容
      ctx.drawImage(
        canvas,
        x, y,
        scaledWidth,
        scaledHeight
      );

      // 获取图片数据
      const dataUrl = tempCanvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];

      // 生成文件名
      const timestamp = new Date().getTime();
      const fileName = `wallpaper_${timestamp}.png`;

      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true
        });

        const savedFile = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache
        });

        await Filesystem.copy({
          from: savedFile.uri,
          to: `PHOTO_${new Date().getTime()}.png`,
          directory: Directory.ExternalStorage,
          toDirectory: Directory.External
        });

        logger.info('Wallpaper saved to gallery:', fileName);
        showToastMessage(t('devtools.toast.screenshot_success'));
      } else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        logger.info('Wallpaper downloaded:', fileName);
        showToastMessage(t('devtools.toast.screenshot_success'));
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      logger.error('Screenshot failed:', error);
      showToastMessage(t('devtools.toast.screenshot_error'));
    }
  };

  // 处理复原应用
  const handleReset = () => {
    resetScene();
    setShowInspector(false);
    if (typeof window !== 'undefined' && window.BABYLON?.Inspector?.IsVisible) {
      window.BABYLON.Inspector.Hide();
    }
  };

  // 切换调试模式
  const toggleDebug = () => {
    const nextDebug = !debug;
    setDebug(nextDebug);
    showToastMessage(t(nextDebug ? 'devtools.toast.debug_on' : 'devtools.toast.debug_off'));
  };

  // 切换渲染模式
  const toggleMode = () => {
    const nextMode = mode === 'canvas' ? 'div' : 'canvas';
    logger.info('Toggling render mode:', { currentMode: mode, nextMode });
    setMode(nextMode);
    showToastMessage(t(nextMode === 'canvas' ? 'devtools.toast.mode_canvas' : 'devtools.toast.mode_div'));
  };

  const handleResetTutorial = () => {
    setHasCompletedTutorial(false);
    window.location.reload();
  };

  return (
    <>
      {showInspector && <InspectorWrapper />}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton>
          <IonIcon icon={buildOutline} />
        </IonFabButton>
        <IonFabList side="top">
          <IonFabButton onClick={takeScreenshot} title={t('screenshot')}>
            <IonIcon icon={cameraOutline} />
          </IonFabButton>
          <IonFabButton onClick={toggleInspector} title={t('inspector')}>
            <IonIcon icon={cubeOutline} />
          </IonFabButton>
          <IonFabButton onClick={handleReset} title={t('reset')}>
            <IonIcon icon={refreshOutline} />
          </IonFabButton>
          <div className="fab-button-wrapper">
            <IonLabel className="fab-label">{t('devtools.language')}</IonLabel>
            <IonFabButton onClick={toggleLanguage}>
              <IonIcon icon={languageOutline} />
            </IonFabButton>
          </div>

          <div className="fab-button-wrapper">
            <IonLabel className="fab-label">{t('devtools.debug')}</IonLabel>
            <IonFabButton onClick={toggleDebug}>
              <IonIcon icon={layersOutline} />
            </IonFabButton>
          </div>

          <div className="fab-button-wrapper">
            <IonLabel className="fab-label">{t('devtools.mode')}</IonLabel>
            <IonFabButton 
              onClick={toggleMode}
              color={mode === 'canvas' ? 'primary' : 'secondary'}
            >
              <IonIcon icon={mode === 'canvas' ? brushOutline : squareOutline} />
            </IonFabButton>
          </div>

          <div className="fab-button-wrapper">
            <IonLabel className="fab-label">{t('devtools.tutorial_reset')}</IonLabel>
            <IonFabButton onClick={handleResetTutorial}>
              <IonIcon icon={refreshOutline} />
            </IonFabButton>
          </div>
        </IonFabList>
      </IonFab>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
        color="primary"
      />
      {children}
    </>
  );
};

export default DevTools;
