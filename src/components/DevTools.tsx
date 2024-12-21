import React, { useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonPopover, IonContent, IonToast } from '@ionic/react';
import { buildOutline, languageOutline, cameraOutline } from 'ionicons/icons';
import { Inspector } from 'react-dev-inspector';
import { useTranslation } from 'react-i18next';
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';
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

  const takeScreenshot = async () => {
    try {
      // 获取背景元素
      const element = document.querySelector('.flex-1') as HTMLElement;
      if (!element) {
        throw new Error('Background element not found');
      }

      // 使用 html2canvas 捕获元素
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        logging: false,
        useCORS: true
      });

      // 转换为 base64
      const base64Data = canvas.toDataURL('image/png').split(',')[1];

      // 生成文件名
      const timestamp = new Date().getTime();
      const fileName = `colorcard_${timestamp}.png`;

      // 保存文件
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });

      // 将文件从缓存复制到相册
      const savedFile = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Cache
      });

      // 使用 Capacitor API 保存到相册
      await Filesystem.copy({
        from: savedFile.uri,
        to: `PHOTO_${timestamp}.png`,
        directory: Directory.Photos,
        toDirectory: Directory.External
      });

      // 显示成功消息
      setToastMessage('Screenshot saved to gallery');
      setShowToast(true);

    } catch (error) {
      console.error('Screenshot error:', error);
      setToastMessage('Failed to save screenshot');
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
              onMouseEnter={(e) => showTooltip(e, 'Take Screenshot')}
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
