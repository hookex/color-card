/**
 * 颜色卡片组件
 * 显示颜色信息，支持选择和收藏功能
 * 
 * @description 特性：
 * - 响应式设计
 * - 触觉反馈
 * - 无障碍支持
 */

import React, { useCallback } from 'react';
import { ColorInfo } from '../types';
import { getContrastColor } from '../utils/backgroundUtils';
import './ColorCard.scss';

/**
 * 颜色卡片Props
 */
interface ColorCardProps {
  card: ColorInfo;
  isActive?: boolean;
  onClick: (color: string) => void;
  className?: string;
}

/**
 * 颜色卡片组件
 */
const ColorCard: React.FC<ColorCardProps> = ({
  card,
  isActive = false,
  onClick,
  className = ''
}) => {

  /**
   * 文本截断工具函数
   */
  const truncateText = useCallback((text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) : text;
  }, []);

  /**
   * 处理卡片点击
   */
  const handleCardClick = useCallback(() => {
    onClick(card.color);
  }, [onClick, card.color]);


  return (
    <div
      className={`color-card ${isActive ? 'active' : ''} ${className}`}
      style={{
        '--card-color': card.color,
        '--text-color': getContrastColor(card.color)
      } as React.CSSProperties}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`选择颜色 ${card.zhName} ${card.color}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="color-info">
        <div className="color-info__header">
          <h3 className="zh-name">{truncateText(card.zhName, 5)}</h3>
        </div>
        
        <div className="description">{card.description}</div>
        
        <div className="color-code">
          <span className="hex">{card.color}</span>
        </div>
      </div>
      
      {/* 激活状态指示器 */}
      {isActive && (
        <div className="active-indicator" aria-hidden="true">
          <div className="active-dot"></div>
        </div>
      )}
    </div>
  );
};

export default ColorCard;
