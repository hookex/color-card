/**
 * 颜色类型选择器组件
 * 基于原有的LiquidGlassSegment，提供颜色类型切换功能
 * 
 * @description 特性：
 * - 液体玻璃效果
 * - 平滑动画过渡
 * - 触觉反馈支持
 * - 响应式设计
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorType } from '../../stores/slices/colorSlice';
import LiquidGlassSegment from '../LiquidGlassSegment';
import createLogger from '../../utils/logger';

const logger = createLogger('ColorTypeSegment');

/**
 * 颜色类型选择器Props
 */
export interface ColorTypeSegmentProps {
  value: ColorType;
  onSelectionChange: (colorType: ColorType) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 颜色类型配置
 */
const COLOR_TYPE_CONFIG = [
  { value: 'brand', labelKey: 'colorTypes.brand' },
  { value: 'chinese', labelKey: 'colorTypes.chinese' },
  { value: 'nature', labelKey: 'colorTypes.nature' },
  { value: 'food', labelKey: 'colorTypes.food' },
  { value: 'mood', labelKey: 'colorTypes.mood' },
  { value: 'space', labelKey: 'colorTypes.space' }
] as const;

/**
 * 颜色类型选择器组件
 */
const ColorTypeSegment: React.FC<ColorTypeSegmentProps> = ({
  value,
  onSelectionChange,
  disabled = false,
  className = ''
}) => {
  const { t } = useTranslation();

  /**
   * 处理选择变化
   */
  const handleSelectionChange = useCallback((newValue: string) => {
    if (disabled || newValue === value) return;

    const colorType = newValue as ColorType;
    logger.info('Color type selection changed:', colorType);
    
    onSelectionChange(colorType);
  }, [value, onSelectionChange, disabled]);

  /**
   * 构建选项数据
   */
  const options = COLOR_TYPE_CONFIG.map(config => ({
    value: config.value,
    label: t(config.labelKey, config.value) // 使用翻译，fallback到原值
  }));

  return (
    <div className={`color-type-segment ${className}`}>
      <LiquidGlassSegment
        value={value}
        onSelectionChange={handleSelectionChange}
        options={options}
        disabled={disabled}
      />
    </div>
  );
};

export default React.memo(ColorTypeSegment);