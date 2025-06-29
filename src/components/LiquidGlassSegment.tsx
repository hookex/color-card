import React from 'react';
import { IonLabel } from '@ionic/react';
import AppleLiquidGlass from './AppleLiquidGlass';
import { ColorType } from '../stores/useStore';
import useStore from '../stores/useStore';
import { tabs } from '../config/tabConfig';
import { getLuminance } from '../utils/backgroundUtils';
import './LiquidGlassSegment.scss';

interface LiquidGlassSegmentProps {
  value: ColorType;
  onSelectionChange: (value: ColorType) => void;
}

const LiquidGlassSegment: React.FC<LiquidGlassSegmentProps> = ({ value, onSelectionChange }) => {
  const color = useStore(state => state.color);
  
  // 计算基于当前颜色的液态玻璃颜色
  const getGlassColor = (isActive: boolean) => {
    if (isActive) {
      return color;
    }
    
    // 非活跃状态使用半透明的当前颜色
    const luminance = getLuminance(color);
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // 响应式计算tab尺寸
  const screenWidth = window.innerWidth;
  const totalTabs = tabs.length;
  const containerPadding = 32; // 左右各16px
  const tabGap = 4; // tab之间的间距
  const totalGapWidth = (totalTabs - 1) * tabGap;
  const availableWidth = screenWidth - containerPadding - totalGapWidth;
  
  // 计算最佳tab宽度，确保美观和可用性
  const idealTabWidth = availableWidth / totalTabs;
  const minTabWidth = 72;
  const maxTabWidth = 110;
  const tabWidth = Math.max(minTabWidth, Math.min(maxTabWidth, idealTabWidth));
  const tabHeight = 36; // 减小高度，更加精致

  return (
    <div className="liquid-glass-segment">
      <div className="segment-container" style={{ gap: `${tabGap}px` }}>
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          const glassColor = getGlassColor(isActive);
          
          return (
            <AppleLiquidGlass
              key={tab.value}
              width={tabWidth}
              height={tabHeight}
              backgroundColor={color} // 使用当前颜色作为背景
              borderRadius={18}
              isActive={isActive}
              adaptiveMode="auto" // 自动适应亮暗模式
              className="segment-button"
              onClick={() => onSelectionChange(tab.value as ColorType)}
            >
              <IonLabel
                className={`segment-label ${isActive ? 'active' : ''}`}
                style={{
                  color: isActive 
                    ? getLuminance(color) > 0.5 ? '#000000' : '#FFFFFF'
                    : getLuminance(color) > 0.5 ? '#666666' : '#AAAAAA',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '13px', // 稍微减小字体
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '0.2px', // 添加字母间距
                  textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {tab.label}
              </IonLabel>
            </AppleLiquidGlass>
          );
        })}
      </div>
    </div>
  );
};

export default LiquidGlassSegment;