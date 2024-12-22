import React from 'react';
import { ColorInfo } from '../types';
import '../styles/components/ColorCard.scss';

interface ColorCardProps {
  card: ColorInfo;
  isActive: boolean;
  onClick: (color: string) => void;
  getCardStyle: (color: string) => React.CSSProperties;
}

const ColorCard: React.FC<ColorCardProps> = ({ card, isActive, onClick, getCardStyle }) => {
  return (
    <div
      key={card.color}
      className={`color-card ${isActive ? 'active' : ''}`}
      style={getCardStyle(card.color)}
      onClick={() => onClick(card.color)}
    >
      <div className="color-info">
        <div className="zh-name">{card.zhName}</div>
        <div className="description">{card.description}</div>
        <div className="color-code">
          <span className="hex">{card.color}</span>
        </div>
      </div>
    </div>
  );
};

export default ColorCard;
