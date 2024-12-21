import React, { useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonLabel } from '@ionic/react';
import { buildOutline, languageOutline } from 'ionicons/icons';
import { Inspector } from 'react-dev-inspector';
import { useTranslation } from 'react-i18next';

const InspectorWrapper = Inspector;

interface Props {
  children: React.ReactNode;
}

const DevTools: React.FC<Props> = ({ children }) => {
  const { i18n } = useTranslation();
  const [showInspector, setShowInspector] = useState(false);

  const toggleInspector = () => {
    setShowInspector(!showInspector);
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
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
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton size="small" className="bg-gray-800">
          <IonIcon icon={buildOutline} />
        </IonFabButton>
        <IonFabList side="top">
          <IonFabButton onClick={toggleInspector} className="bg-blue-600">
            <IonIcon icon={buildOutline} />
            <IonLabel className="ml-2 text-xs">
              {showInspector ? 'Disable' : 'Enable'} Inspector
            </IonLabel>
          </IonFabButton>
          <IonFabButton onClick={toggleLanguage} className="bg-green-600">
            <IonIcon icon={languageOutline} />
            <IonLabel className="ml-2 text-xs">
              {i18n.language === 'en' ? '切换到中文' : 'Switch to English'}
            </IonLabel>
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </>
  );
};

export default DevTools;
