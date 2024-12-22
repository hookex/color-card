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
import { getLuminance } from '../utils/backgroundUtils';

export type TextureType = 'solid' | 'leather' | 'paint' | 'glass' | 'linear' | 'glow' | 'frosted';

interface Props {
  color: string;
  onColorChange: (color: string) => void;
  texture: TextureType;
  onTextureChange: (texture: TextureType) => void;
}

const TextureTools: React.FC<Props> = ({ color, onColorChange, texture, onTextureChange }) => {
  const { t } = useTranslation();

  // 计算玻璃效果的透明度
  const getGlassOpacity = () => {
    const luminance = getLuminance(color);
    // 亮度越高，透明度越低（颜色越深）
    return 0.05 + (1 - luminance) * 0.15;
  };

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

  return (
    <div 
      className="glass-toolbar" 
      style={{ 
        '--glass-opacity': getGlassOpacity(),
      } as React.CSSProperties}
    >
      <IonToolbar>
        <IonButtons slot="start">
          {enabledTextures.map(({ type, icon, activeIcon, label }) => (
            <IonButton
              key={type}
              onClick={() => onTextureChange(type)}
              className={texture === type ? 'active' : ''}
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
