import React from 'react';
import { IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { 
  colorPaletteOutline, 
  diamondOutline,
  carSportOutline, 
  prismOutline 
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import '../styles/components/GlassToolbar.scss';

export type TextureType = 'solid' | 'leather' | 'paint' | 'glass';

interface Props {
  color: string;
  onColorChange: (color: string) => void;
  texture: TextureType;
  onTextureChange: (texture: TextureType) => void;
}

const TextureTools: React.FC<Props> = ({ color, onColorChange, texture, onTextureChange }) => {
  const { t } = useTranslation();

  const textures: { type: TextureType; icon: string }[] = [
    { type: 'solid', icon: colorPaletteOutline },
    { type: 'leather', icon: diamondOutline },
    { type: 'paint', icon: carSportOutline },
    { type: 'glass', icon: prismOutline },
  ];

  return (
    <div className="glass-toolbar">
      <IonToolbar>
        <IonButtons slot="start">
          {textures.map(({ type, icon }) => (
            <IonButton
              key={type}
              onClick={() => onTextureChange(type)}
              className={texture === type ? 'selected' : ''}
            >
              <IonIcon icon={icon} />
            </IonButton>
          ))}
        </IonButtons>
      </IonToolbar>
    </div>
  );
};

export default TextureTools;
