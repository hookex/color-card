import React, { useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonPopover, IonContent } from '@ionic/react';
import { buildOutline, languageOutline } from 'ionicons/icons';
import { Inspector } from 'react-dev-inspector';
import { useTranslation } from 'react-i18next';
import './DevTools.scss';

const InspectorWrapper = Inspector;

interface Props {
  children: React.ReactNode;
}

const DevTools: React.FC<Props> = ({ children }) => {
  const { i18n } = useTranslation();
  const [showInspector, setShowInspector] = useState(false);
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
      </div>
    </>
  );
};

export default DevTools;
