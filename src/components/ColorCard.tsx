import React from 'react';
import { ColorInfo } from '../types';

interface ColorCardProps {
  card: ColorInfo;
  isActive?: boolean;
  onClick: (color: string) => void;
  getCardStyle?: (color: string) => React.CSSProperties;
}

const ColorCard: React.FC<ColorCardProps> = ({
  card,
  isActive,
  onClick,
  getCardStyle
}) => {
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) : text;
  };

  return (
    <div
      key={card.color}
      className={`color-card ${isActive ? 'active' : ''}`}
      style={getCardStyle?.(card.color)}
      onClick={() => onClick(card.color)}
    >
      <div className="color-info">
        <h3 className="zh-name">{truncateText(card.zhName, 5)}</h3>
        <div className="description">{card.description}</div>
        <div className="color-code">
          <span className="hex">{card.color}</span>
        </div>
      </div>
    </div>
  );
};

export default ColorCard;
