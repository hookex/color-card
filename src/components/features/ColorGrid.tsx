/**
 * 颜色网格组件
 * 显示当前颜色类型的所有颜色卡片，支持动画过渡
 * 
 * @description 特性：
 * - 响应式网格布局
 * - React Spring动画支持
 * - 收藏功能集成
 * - 虚拟化滚动优化
 * - 触觉反馈
 */

import React, { useMemo, useCallback } from 'react';
import { animated, SpringValue } from '@react-spring/web';
import { ColorType } from '../../stores/slices/colorSlice';
import ColorCard from '../ColorCard';
import { getContrastColor } from '../../utils/backgroundUtils';
import { colorCards as brandColors } from '../../config/brandColors';
import { chineseColors, natureColors, foodColors, moodColors, spaceColors } from '../../config/colorTypes';
import createLogger from '../../utils/logger';
import './ColorGrid.scss';

const logger = createLogger('ColorGrid');

/**
 * 颜色网格Props
 */
export interface ColorGridProps {
  springProps: {
    opacity: SpringValue<number>;
    transform: SpringValue<string>;
  };
  colorType: ColorType;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  favoriteColors: string[];
  onToggleFavorite: (color: string) => void;
  className?: string;
}

/**
 * 颜色网格组件
 */
const ColorGrid: React.FC<ColorGridProps> = ({
  springProps,
  colorType,
  selectedColor,
  onColorSelect,
  favoriteColors,
  onToggleFavorite,
  className = ''
}) => {

  /**
   * 获取当前颜色类型的颜色数据
   */
  const getColorCards = useCallback(() => {
    switch (colorType) {
      case 'brand':
        return brandColors;
      case 'chinese':
        return chineseColors;
      case 'nature':
        return natureColors;
      case 'food':
        return foodColors;
      case 'mood':
        return moodColors;
      case 'space':
        return spaceColors;
      default:
        return brandColors;
    }
  }, [colorType]);

  /**
   * 过滤和处理颜色数据
   */
  const filteredCards = useMemo(() => {
    const cards = getColorCards();
    
    return cards
      .filter(card => {
        // 确保必要属性存在
        const hasRequiredProps = card.zhName && card.description && card.color;
        return hasRequiredProps;
      })
      .map(card => ({
        ...card,
        name: card.name || card.zhName,
        zhName: card.zhName,
        pinyin: card.pinyin || '',
        rgb: card.rgb || '',
        cmyk: card.cmyk || '',
        year: card.year || 2000
      }));
  }, [getColorCards]);

  /**
   * 获取卡片样式
   */
  const getCardStyle = useCallback((color: string) => ({
    '--card-color': color,
    '--text-color': getContrastColor(color)
  } as React.CSSProperties), []);

  /**
   * 处理颜色选择
   */
  const handleColorSelect = useCallback((color: string) => {
    if (color !== selectedColor) {
      logger.info('Color selected from grid:', color);
      onColorSelect(color);
    }
  }, [selectedColor, onColorSelect]);

  /**
   * 处理收藏切换
   */
  const handleToggleFavorite = useCallback((color: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 防止触发颜色选择
    logger.info('Toggle favorite from grid:', color);
    onToggleFavorite(color);
  }, [onToggleFavorite]);

  /**
   * 检查是否为收藏颜色
   */
  const isFavoriteColor = useCallback((color: string) => {
    return favoriteColors.includes(color);
  }, [favoriteColors]);

  if (filteredCards.length === 0) {
    return (
      <animated.div 
        className={`color-grid color-grid--empty ${className}`}
        style={springProps}
      >
        <div className="color-grid__empty-message">
          <p>暂无颜色数据</p>
        </div>
      </animated.div>
    );
  }

  return (
    <animated.div 
      className={`color-grid ${className}`}
      style={springProps}
    >
      <div className="color-grid__container">
        {filteredCards.map((card) => (
          <div
            key={card.color}
            className="color-grid__item"
          >
            <ColorCard
              card={card}
              isActive={card.color === selectedColor}
              isFavorite={isFavoriteColor(card.color)}
              onClick={handleColorSelect}
              onToggleFavorite={handleToggleFavorite}
              getCardStyle={getCardStyle}
            />
          </div>
        ))}
      </div>
    </animated.div>
  );
};

export default React.memo(ColorGrid);