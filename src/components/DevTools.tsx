import React, { useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonToast } from '@ionic/react';
import { buildOutline, languageOutline, cameraOutline, cubeOutline } from 'ionicons/icons';
import { Inspector } from 'react-dev-inspector';
import { useTranslation } from 'react-i18next';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import './DevTools.scss';

const InspectorWrapper = Inspector;

interface Props {
  children: React.ReactNode;
  debug?: boolean;
  onDebugChange?: (debug: boolean) => void;
}

const DevTools: React.FC<Props> = ({ children, debug = false, onDebugChange }) => {
  const { i18n } = useTranslation();
  const [showInspector, setShowInspector] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toggleInspector = () => {
    setShowInspector(!showInspector);
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const toggle3DMode = () => {
    if (onDebugChange) {
      onDebugChange(!debug);
    }
  };

  const saveToGallery = async (base64Data: string, fileName: string) => {
    try {
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
        directory: Directory.Photos,
        toDirectory: Directory.External
      });

      setToastMessage('Wallpaper saved to gallery');
      setShowToast(true);
    } catch (error) {
      console.error('Save to gallery error:', error);
      throw error;
    }
  };

  const downloadInBrowser = (dataUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      setToastMessage('Wallpaper downloaded');
      setShowToast(true);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  const takeScreenshot = async () => {
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas element not found');
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

      const timestamp = new Date().getTime();
      const fileName = `wallpaper_${timestamp}.png`;

      const dataUrl = tempCanvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];

      if (Capacitor.isNativePlatform()) {
        await saveToGallery(base64Data, fileName);
      } else {
        downloadInBrowser(dataUrl, fileName);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      setToastMessage('Failed to save wallpaper');
      setShowToast(true);
    }
  };

  return (
    <>
      {showInspector ? (
        <InspectorWrapper
          keys={['control', 'shift', 'command', 'c']}
          disableLaunchEditor={false}
          onHoverElement={() => {}}
        >
          {children}
        </InspectorWrapper>
      ) : (
        children
      )}
      <div className="dev-tools">
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton size="small" className="bg-gray-800">
            <IonIcon icon={buildOutline} />
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton 
              onClick={toggleInspector} 
              className="bg-blue-600"
            >
              <IonIcon icon={buildOutline} />
            </IonFabButton>
            <IonFabButton 
              onClick={toggleLanguage} 
              className="bg-green-600"
            >
              <IonIcon icon={languageOutline} />
            </IonFabButton>
            <IonFabButton 
              onClick={takeScreenshot}
              className="bg-purple-600"
            >
              <IonIcon icon={cameraOutline} />
            </IonFabButton>
            <IonFabButton 
              onClick={toggle3DMode}
              className={debug ? 'bg-primary' : 'bg-orange-600'}
            >
              <IonIcon icon={cubeOutline} />
            </IonFabButton>
          </IonFabList>
        </IonFab>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color={toastMessage.includes('Failed') ? 'danger' : 'success'}
        />
      </div>
    </>
  );
};

export default DevTools;
