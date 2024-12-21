import React, { useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonPopover, IonContent, IonToast } from '@ionic/react';
import { buildOutline, languageOutline, cameraOutline } from 'ionicons/icons';
import { Inspector } from 'react-dev-inspector';
import { useTranslation } from 'react-i18next';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import './DevTools.scss';

const InspectorWrapper = Inspector;

interface Props {
  children: React.ReactNode;
}

const DevTools: React.FC<Props> = ({ children }) => {
  const { i18n } = useTranslation();
  const [showInspector, setShowInspector] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [popoverState, setPopoverState] = useState<{
    open: boolean;
    event: any;
    content: string;
  }>({
    open: false,
    event: undefined,
    content: '',
  });

  const toggleInspector = () => {
    setShowInspector(!showInspector);
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const showTooltip = (event: any, content: string) => {
    event.persist();
    setPopoverState({ open: true, event, content });
  };

  const saveToGallery = async (base64Data: string, fileName: string) => {
    try {
      // 保存文件到缓存
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });

      // 获取缓存文件的 URI
      const savedFile = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Cache
      });

      // 复制到相册
      await Filesystem.copy({
        from: savedFile.uri,
        to: `PHOTO_${new Date().getTime()}.png`,
        directory: Directory.Photos,
        toDirectory: Directory.External
      });

      setToastMessage('Color saved to gallery');
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
      setToastMessage('Color downloaded');
      setShowToast(true);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  const createColorImage = (color: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/png');
  };

  const takeScreenshot = async () => {
    try {
      // 获取背景元素
      const element = document.querySelector('.flex-1') as HTMLElement;
      if (!element) {
        throw new Error('Background element not found');
      }

      // 获取背景色
      const computedStyle = window.getComputedStyle(element);
      const backgroundColor = computedStyle.backgroundColor;

      // 生成纯色图片
      const dataUrl = createColorImage(backgroundColor);
      const base64Data = dataUrl.split(',')[1];

      // 生成文件名
      const timestamp = new Date().getTime();
      const fileName = `colorcard_${timestamp}.png`;

      // 根据平台选择保存方式
      if (Capacitor.isNativePlatform()) {
        // 移动设备：保存到相册
        await saveToGallery(base64Data, fileName);
      } else {
        // 浏览器：下载文件
        downloadInBrowser(dataUrl, fileName);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      setToastMessage('Failed to save color');
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
              onMouseEnter={(e) => showTooltip(e, showInspector ? 'Disable Inspector' : 'Enable Inspector')}
              onMouseLeave={() => setPopoverState({ ...popoverState, open: false })}
            >
              <IonIcon icon={buildOutline} />
            </IonFabButton>
            <IonFabButton 
              onClick={toggleLanguage} 
              className="bg-green-600"
              onMouseEnter={(e) => showTooltip(e, i18n.language === 'en' ? '切换到中文' : 'Switch to English')}
              onMouseLeave={() => setPopoverState({ ...popoverState, open: false })}
            >
              <IonIcon icon={languageOutline} />
            </IonFabButton>
            <IonFabButton 
              onClick={takeScreenshot}
              className="bg-purple-600"
              onMouseEnter={(e) => showTooltip(e, Capacitor.isNativePlatform() ? 'Save Color to Gallery' : 'Download Color')}
              onMouseLeave={() => setPopoverState({ ...popoverState, open: false })}
            >
              <IonIcon icon={cameraOutline} />
            </IonFabButton>
          </IonFabList>
        </IonFab>
        <IonPopover
          isOpen={popoverState.open}
          event={popoverState.event}
          onDidDismiss={() => setPopoverState({ ...popoverState, open: false })}
          side="start"
          alignment="center"
          className="dev-tools-popover"
        >
          <IonContent className="ion-padding">
            {popoverState.content}
          </IonContent>
        </IonPopover>
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
