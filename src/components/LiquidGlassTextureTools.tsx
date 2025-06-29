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
import AppleLiquidGlass from './AppleLiquidGlass';
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

  // 计算液态玻璃颜色
  const getGlassColor = (isActive: boolean) => {
    if (isActive) {
      return color;
    }
    
    const luminance = getLuminance(color);
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // 响应式计算按钮尺寸和布局
  const screenWidth = window.innerWidth;
  const totalButtons = enabledTextures.length;
  const containerPadding = 48; // 左右各24px
  const buttonGap = 8; // 按钮间距
  const labelHeight = 16; // 标签高度
  
  // 计算最佳按钮尺寸
  const totalGapWidth = (totalButtons - 1) * buttonGap;
  const availableWidth = screenWidth - containerPadding - totalGapWidth;
  const idealButtonSize = availableWidth / totalButtons;
  const minButtonSize = 48;
  const maxButtonSize = 64;
  const buttonSize = Math.max(minButtonSize, Math.min(maxButtonSize, idealButtonSize));

  return (
    <div className="liquid-glass-texture-tools">
      <div className="tools-container" style={{ gap: `${buttonGap}px` }}>
        {enabledTextures.map((textureItem) => {
          const isActive = textureItem.type === texture;
          const glassColor = getGlassColor(isActive);
          const luminance = getLuminance(color);
          
          return (
            <div key={textureItem.type} className="texture-button-wrapper">
              <LiquidGlassWebGL
                width={buttonSize}
                height={buttonSize}
                backgroundColor={glassColor}
                borderRadius={buttonSize / 2} // 完全圆形
                opacity={isActive ? 0.9 : 0.5}
                animated={true}
                isActive={isActive}
                intensity={isActive ? 1.3 : 0.9}
                className="texture-button"
                onClick={() => onTextureChange(textureItem.type)}
              >
                <div className="button-content">
                  <IonIcon 
                    icon={isActive ? textureItem.activeIcon : textureItem.icon}
                    style={{
                      fontSize: Math.min(24, buttonSize * 0.4) + 'px', // 响应式图标大小
                      color: isActive 
                        ? luminance > 0.5 ? '#000000' : '#FFFFFF'
                        : luminance > 0.5 ? '#555555' : '#BBBBBB',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none'
                    }}
                  />
                </div>
              </LiquidGlassWebGL>
              
              {/* 标签 */}
              <div 
                className={`button-label ${isActive ? 'active' : ''}`}
                style={{
                  color: isActive 
                    ? luminance > 0.5 ? '#000000' : '#FFFFFF'
                    : luminance > 0.5 ? '#666666' : '#AAAAAA',
                  fontSize: Math.max(10, Math.min(12, buttonSize * 0.2)) + 'px', // 响应式字体大小
                  marginTop: Math.max(4, buttonSize * 0.08) + 'px' // 响应式间距
                }}
              >
                {textureItem.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiquidGlassTextureTools;