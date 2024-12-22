import React from 'react';
import { IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { 
  squareOutline,
  square,
  prismOutline,
  prism,
  sparklesOutline,
  sparkles,
  ellipseOutline,
  ellipse,
  waterOutline,
  water,
  leafOutline,
  leaf
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { getEnabledTextures } from '../config/textureConfig';

export type TextureType = 'solid' | 'leather' | 'paint' | 'glass' | 'linear' | 'glow' | 'frosted';

interface Props {
  color: string;
  onColorChange: (color: string) => void;
  texture: TextureType;
  onTextureChange: (texture: TextureType) => void;
}

const TextureTools: React.FC<Props> = ({ color, onColorChange, texture, onTextureChange }) => {
  const { t } = useTranslation();

  const allTextures: { type: TextureType; icon: string; activeIcon: string; label: string }[] = [
    { type: 'solid', icon: squareOutline, activeIcon: square, label: '原色' },
    { type: 'linear', icon: ellipseOutline, activeIcon: ellipse, label: '平滑' },
    { type: 'glow', icon: sparklesOutline, activeIcon: sparkles, label: '光芒' },
    { type: 'leather', icon: leafOutline, activeIcon: leaf, label: '小羊皮' },
    { type: 'paint', icon: prismOutline, activeIcon: prism, label: '玉石' },
    { type: 'frosted', icon: waterOutline, activeIcon: water, label: '毛玻璃' },
  ];

  // 只显示启用的材质
  const enabledTextures = allTextures.filter(texture => 
    getEnabledTextures().includes(texture.type)
  );

  // 生成选中态的样式
  const getSelectedStyle = (isSelected: boolean) => {
    if (!isSelected) return {};
    return {
      '--selected-color': color,
      '--selected-shadow-color': `${color}b3`, // 70% opacity
    } as React.CSSProperties;
  };

  return (
    <div className="glass-toolbar" style={{ '--toolbar-selected-color': color } as React.CSSProperties}>
      <IonToolbar>
        <IonButtons slot="start">
          {enabledTextures.map(({ type, icon, activeIcon, label }) => (
            <IonButton
              key={type}
              onClick={() => onTextureChange(type)}
              className={texture === type ? 'active' : ''}
              style={getSelectedStyle(texture === type)}
            >
              <div className="button-content">
                <IonIcon icon={texture === type ? activeIcon : icon} />
                <span className="button-label">{label}</span>
              </div>
            </IonButton>
          ))}
        </IonButtons>
      </IonToolbar>
    </div>
  );
};

export default TextureTools;
