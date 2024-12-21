import React, { useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonTooltip } from '@ionic/react';
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
      <div className="dev-tools">
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton size="small" className="bg-gray-800">
            <IonIcon icon={buildOutline} />
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton 
              onClick={toggleInspector} 
              className="bg-blue-600"
              id="inspector-btn"
            >
              <IonIcon icon={buildOutline} />
              <IonTooltip trigger="inspector-btn" side="start">
                {showInspector ? 'Disable' : 'Enable'} Inspector
              </IonTooltip>
            </IonFabButton>
            <IonFabButton 
              onClick={toggleLanguage} 
              className="bg-green-600"
              id="language-btn"
            >
              <IonIcon icon={languageOutline} />
              <IonTooltip trigger="language-btn" side="start">
                {i18n.language === 'en' ? '切换到中文' : 'Switch to English'}
              </IonTooltip>
            </IonFabButton>
          </IonFabList>
        </IonFab>
      </div>
    </>
  );
};

export default DevTools;
