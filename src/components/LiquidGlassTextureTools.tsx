import React from 'react';
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
import { TextureType } from './TextureTools';
import { getEnabledTextures } from '../config/textureConfig';
import useStore from '../stores/useStore';
import { getLuminance } from '../utils/backgroundUtils';
import './LiquidGlassTextureTools.scss';

interface LiquidGlassTextureToolsProps {
  texture: TextureType;
  onTextureChange: (texture: TextureType) => void;
}

const LiquidGlassTextureTools: React.FC<LiquidGlassTextureToolsProps> = ({ 
  texture, 
  onTextureChange 
}) => {
  const color = useStore(state => state.color);
  
  const allTextures: { type: TextureType; icon: string; activeIcon: string; label: string }[] = [
    { type: 'solid', icon: squareOutline, activeIcon: square, label: '原色' },
    { type: 'linear', icon: ellipseOutline, activeIcon: ellipse, label: '线性' },
    { type: 'glow', icon: sparklesOutline, activeIcon: sparkles, label: '光芒' },
    { type: 'leather', icon: leafOutline, activeIcon: leaf, label: '小羊皮' },
    { type: 'paint', icon: prismOutline, activeIcon: prism, label: '玉石' },
    { type: 'frosted', icon: waterOutline, activeIcon: water, label: '毛玻璃' },
  ];

  // 只显示启用的材质
  const enabledTextures = allTextures.filter(t => 
    getEnabledTextures().includes(t.type)
  );


  // 响应式计算按钮尺寸和布局
  const screenWidth = window.innerWidth;
  const totalButtons = enabledTextures.length;
  const containerPadding = 48; // 左右各24px
  const buttonGap = 8; // 按钮间距
  const labelHeight = 16; // 标签高度
  
  // 计算最佳按钮尺寸 - 减小尺寸
  const totalGapWidth = (totalButtons - 1) * buttonGap;
  const availableWidth = screenWidth - containerPadding - totalGapWidth;
  const idealButtonSize = availableWidth / totalButtons;
  const minButtonSize = 40; // 减小最小尺寸
  const maxButtonSize = 52; // 减小最大尺寸
  const buttonSize = Math.max(minButtonSize, Math.min(maxButtonSize, idealButtonSize));

  return (
    <div 
      className="liquid-glass-texture-tools"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '8px 24px calc(8px + env(safe-area-inset-bottom, 0px)) 24px'
      }}
    >
      <div className="glass-background">
        <div className="tools-container" style={{ gap: `${buttonGap}px` }}>
          {enabledTextures.map((textureItem) => {
            const isActive = textureItem.type === texture;
            const luminance = getLuminance(color);
            
            return (
              <div key={textureItem.type} className="texture-button-wrapper">
                <div
                  className={`texture-button ${isActive ? 'active' : ''}`}
                  style={{
                    width: buttonSize + 'px',
                    height: buttonSize + 'px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: isActive 
                      ? `rgba(${luminance > 0.5 ? '0,0,0' : '255,255,255'}, 0.2)`
                      : `rgba(${luminance > 0.5 ? '0,0,0' : '255,255,255'}, 0.1)`,
                    border: `1px solid rgba(${luminance > 0.5 ? '0,0,0' : '255,255,255'}, ${isActive ? '0.3' : '0.15'})`,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={() => onTextureChange(textureItem.type)}
                >
                  <IonIcon 
                    icon={isActive ? textureItem.activeIcon : textureItem.icon}
                    style={{
                      fontSize: Math.min(24, buttonSize * 0.4) + 'px',
                      color: isActive 
                        ? luminance > 0.5 ? '#000000' : '#FFFFFF'
                        : luminance > 0.5 ? '#555555' : '#BBBBBB',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none'
                    }}
                  />
                </div>
                
                {/* 标签 */}
                <div 
                  className={`button-label ${isActive ? 'active' : ''}`}
                  style={{
                    color: isActive 
                      ? luminance > 0.5 ? '#000000' : '#FFFFFF'
                      : luminance > 0.5 ? '#666666' : '#AAAAAA',
                    fontSize: Math.max(9, Math.min(11, buttonSize * 0.2)) + 'px', // 稍微减小字体大小
                    marginTop: Math.max(2, buttonSize * 0.06) + 'px' // 减少间距
                  }}
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