import React, { useMemo } from 'react';
import { IonIcon } from '@ionic/react';
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
import { TextureType } from '../types';
import { getEnabledTextures } from '../config/textureConfig';
import { useAppStore } from '../stores/useAppStore';
import { getLuminance } from '../utils/backgroundUtils';
import './LiquidGlassTextureTools.scss';

interface LiquidGlassTextureToolsProps {
  texture: TextureType;
  onTextureChange: (texture: TextureType) => void;
  disabled?: boolean;
}

const LiquidGlassTextureTools: React.FC<LiquidGlassTextureToolsProps> = ({ 
  texture, 
  onTextureChange,
  disabled = false
}) => {
  const color = useAppStore(state => state.color);
  
  const allTextures: { type: TextureType; icon: string; activeIcon: string; label: string }[] = [
    { type: 'solid', icon: squareOutline, activeIcon: square, label: '原色' },
    { type: 'linear', icon: ellipseOutline, activeIcon: ellipse, label: '线性' },
    { type: 'glow', icon: sparklesOutline, activeIcon: sparkles, label: '光芒' },
    { type: 'leather', icon: leafOutline, activeIcon: leaf, label: '小羊皮' },
    { type: 'paint', icon: prismOutline, activeIcon: prism, label: '玉石' },
    { type: 'frosted', icon: waterOutline, activeIcon: water, label: '毛玻璃' },
  ];

  // 只显示启用的材质
  const enabledTextures = useMemo(() => 
    allTextures.filter(t => getEnabledTextures().includes(t.type)),
    []
  );

  // 根据背景亮度计算动态颜色
  const dynamicColors = useMemo(() => {
    const luminance = getLuminance(color);
    const isDark = luminance <= 0.5;
    
    return {
      '--button-text-color': isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      '--button-text-color-active': isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
      '--button-icon-color': isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      '--button-icon-color-active': isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
      '--glass-bg-light': isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      '--glass-bg-medium': isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      '--glass-bg-strong': isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      '--glass-border-light': isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      '--glass-border-medium': isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      '--glass-border-strong': isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
    } as React.CSSProperties;
  }, [color]);

  const handleTextureChange = (textureType: TextureType) => {
    if (!disabled) {
      onTextureChange(textureType);
    }
  };

  return (
    <div 
      className="liquid-glass-texture-tools"
      style={dynamicColors}
    >
      <div className="glass-background">
        <div className="tools-container">
          {enabledTextures.map((textureItem) => {
            const isActive = textureItem.type === texture;
            
            return (
              <div key={textureItem.type} className="texture-button-wrapper">
                <div
                  className={`texture-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => handleTextureChange(textureItem.type)}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={`选择${textureItem.label}纹理`}
                  aria-pressed={isActive}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                      e.preventDefault();
                      handleTextureChange(textureItem.type);
                    }
                  }}
                >
                  <IonIcon 
                    icon={isActive ? textureItem.activeIcon : textureItem.icon}
                    aria-hidden="true"
                  />
                </div>
                
                <div 
                  className={`button-label ${isActive ? 'active' : ''}`}
                  aria-hidden="true"
                >
                  {textureItem.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiquidGlassTextureTools;