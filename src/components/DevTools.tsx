import React, { useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonPopover, IonContent, IonToast } from '@ionic/react';
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

  const toggle3DMode = () => {
    if (onDebugChange) {
      onDebugChange(!debug);
    }
  };

  const showTooltip = (event: any, content: string) => {
    event.persist();
    setPopoverState({ open: true, event, content });
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

  const takeScreenshot = async () => {
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      const timestamp = new Date().getTime();
      const fileName = `colorcard_${timestamp}.png`;

      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];

      if (Capacitor.isNativePlatform()) {
        await saveToGallery(base64Data, fileName);
      } else {
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
            <IonFabButton 
              onClick={toggle3DMode}
              className={debug ? 'bg-primary' : 'bg-orange-600'}
              onMouseEnter={(e) => showTooltip(e, debug ? 'Switch to 2D Mode' : 'Switch to 3D Mode')}
              onMouseLeave={() => setPopoverState({ ...popoverState, open: false })}
            >
              <IonIcon icon={cubeOutline} />
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
