import React from 'react';
import { IonLabel } from '@ionic/react';
import { ColorType } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { tabs } from '../config/tabConfig';
import { getLuminance } from '../utils/backgroundUtils';
import './LiquidGlassSegment.scss';

interface LiquidGlassSegmentProps {
  value: ColorType;
  onSelectionChange: (value: ColorType) => void;
  options?: Array<{ value: ColorType; label: string }>;
  disabled?: boolean;
}

const LiquidGlassSegment: React.FC<LiquidGlassSegmentProps> = ({ value, onSelectionChange }) => {
  const color = useAppStore(state => state.color);

  // 响应式计算tab尺寸 - 更紧凑的设计
  const screenWidth = window.innerWidth;
  const totalTabs = tabs.length;
  const containerPadding = 48; // 增加容器边距
  const tabGap = 3; // 减小tab间距，更紧凑
  const totalGapWidth = (totalTabs - 1) * tabGap;
  const availableWidth = screenWidth - containerPadding - totalGapWidth;
  
  // 计算更小的tab尺寸
  const idealTabWidth = availableWidth / totalTabs;
  const minTabWidth = 58; // 减小最小宽度
  const maxTabWidth = 85; // 减小最大宽度
  const tabWidth = Math.max(minTabWidth, Math.min(maxTabWidth, idealTabWidth));
  const tabHeight = 30; // 进一步减小高度

  return (
    <div 
      className="liquid-glass-segment"
      style={{
        position: 'fixed',
        top: 'calc(var(--ion-safe-area-top, 47px) + 6px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '86%',
        maxWidth: '1000px',
        padding: '6px 12px 3px 12px'
      }}
    >
      <div className="glass-background">
        <div className="segment-container" style={{ gap: `${tabGap}px` }}>
          {tabs.map((tab) => {
            const isActive = tab.value === value;
            
            return (
              <div
                key={tab.value}
                className={`segment-button ${isActive ? 'active' : ''}`}
                style={{
                  width: tabWidth + 'px',
                  height: tabHeight + 'px',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: isActive 
                    ? `rgba(${getLuminance(color) > 0.5 ? '0,0,0' : '255,255,255'}, 0.1)`
                    : 'transparent',
                  border: isActive 
                    ? `1px solid rgba(${getLuminance(color) > 0.5 ? '0,0,0' : '255,255,255'}, 0.2)`
                    : '1px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: isActive ? 'blur(10px)' : 'none'
                }}
                onClick={() => onSelectionChange(tab.value as ColorType)}
              >
                <IonLabel
                  className={`segment-label ${isActive ? 'active' : ''}`}
                  style={{
                    color: isActive 
                      ? getLuminance(color) > 0.5 ? '#000000' : '#FFFFFF'
                      : getLuminance(color) > 0.5 ? '#666666' : '#AAAAAA',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '11px',
                    textAlign: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    letterSpacing: '0.1px',
                    textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    margin: 0
                  }}
                >
                  {tab.label}
                </IonLabel>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiquidGlassSegment;