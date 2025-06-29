/**
 * 纹理工具栏组件
 * 基于原有的LiquidGlassTextureTools，提供纹理选择功能
 * 
 * @description 特性：
 * - 液体玻璃效果
 * - 触觉反馈支持
 * - 纹理预览
 * - 响应式设计
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TextureType } from '../../stores/slices/textureSlice';
import LiquidGlassTextureTools from '../LiquidGlassTextureTools';
import createLogger from '../../utils/logger';

const logger = createLogger('TextureToolbar');

/**
 * 纹理工具栏Props
 */
export interface TextureToolbarProps {
  texture: TextureType;
  onTextureChange: (texture: TextureType) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 纹理工具栏组件
 */
const TextureToolbar: React.FC<TextureToolbarProps> = ({
  texture,
  onTextureChange,
  disabled = false,
  className = ''
}) => {
  const { t } = useTranslation();

  /**
   * 处理纹理变化
   */
  const handleTextureChange = useCallback((newTexture: TextureType) => {
    if (disabled || newTexture === texture) return;

    logger.info('Texture selection changed:', newTexture);
    onTextureChange(newTexture);
  }, [texture, onTextureChange, disabled]);

  return (
    <div className={`texture-toolbar ${className}`}>
      <LiquidGlassTextureTools
        texture={texture}
        onTextureChange={handleTextureChange}
        disabled={disabled}
      />
    </div>
  );
};

export default React.memo(TextureToolbar);