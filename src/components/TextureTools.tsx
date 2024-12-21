import React from 'react';
import { IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { 
  colorPaletteOutline, 
  diamondOutline,
  carSportOutline, 
  prismOutline 
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './TextureTools.scss';

export type TextureType = 'solid' | 'leather' | 'paint' | 'glass';

interface Props {
  currentTexture: TextureType;
  onTextureChange: (texture: TextureType) => void;
}

const TextureTools: React.FC<Props> = ({ currentTexture, onTextureChange }) => {
  const { t } = useTranslation();

  const textures: { type: TextureType; icon: string }[] = [
    { type: 'solid', icon: colorPaletteOutline },
    { type: 'leather', icon: diamondOutline },
    { type: 'paint', icon: carSportOutline },
    { type: 'glass', icon: prismOutline },
  ];

  return (
    <IonToolbar className="texture-tools">
      <IonButtons slot="start" className="texture-buttons">
        {textures.map(({ type, icon }) => (
          <IonButton
            key={type}
            fill={currentTexture === type ? 'solid' : 'clear'}
            onClick={() => onTextureChange(type)}
            className={`texture-button ${currentTexture === type ? 'active' : ''}`}
          >
            <div className="texture-button-content">
              <IonIcon icon={icon} />
              <div className="texture-label">
                <div className="texture-name">{t(`textures.${type}.name`)}</div>
                <div className="texture-description">{t(`textures.${type}.description`)}</div>
              </div>
            </div>
          </IonButton>
        ))}
      </IonButtons>
    </IonToolbar>
  );
};

export default TextureTools;
