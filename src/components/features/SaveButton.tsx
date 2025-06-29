/**
 * 保存按钮组件
 * 提供壁纸保存和分享功能
 * 
 * @description 特性：
 * - 液体玻璃效果
 * - 加载状态显示
 * - 触觉反馈
 * - 多操作支持（保存/分享）
 */

import React, { useCallback, useState } from 'react';
import { IonFabButton, IonIcon, IonButton } from '@ionic/react';
import { save, share, download } from 'ionicons/icons';
import { PlatformService, HapticFeedbackType } from '../../services/platform';
import createLogger from '../../utils/logger';
import './SaveButton.scss';

const logger = createLogger('SaveButton');

/**
 * 保存按钮Props
 */
export interface SaveButtonProps {
  onSave: () => Promise<any>;
  onShare?: () => Promise<void>;
  isSaving?: boolean;
  disabled?: boolean;
  showShareButton?: boolean;
  className?: string;
}

/**
 * 保存按钮组件
 */
const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  onShare,
  isSaving = false,
  disabled = false,
  showShareButton = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * 处理保存操作
   */
  const handleSave = useCallback(async () => {
    if (disabled || isSaving) return;

    try {
      logger.info('Save button clicked');
      
      // 触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);
      
      // 执行保存
      await onSave();
      
      // 成功反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Success);
      
      logger.info('Save operation completed');
    } catch (error) {
      logger.error('Save operation failed:', error);
      
      // 错误反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Error);
    }
  }, [onSave, disabled, isSaving]);

  /**
   * 处理分享操作
   */
  const handleShare = useCallback(async () => {
    if (disabled || isSaving || !onShare) return;

    try {
      logger.info('Share button clicked');
      
      // 触觉反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);
      
      // 执行分享
      await onShare();
      
      logger.info('Share operation completed');
    } catch (error) {
      logger.error('Share operation failed:', error);
      
      // 错误反馈
      await PlatformService.triggerHapticFeedback(HapticFeedbackType.Error);
    }
  }, [onShare, disabled, isSaving]);

  /**
   * 切换展开状态
   */
  const toggleExpanded = useCallback(async () => {
    if (!showShareButton) return;
    
    setIsExpanded(prev => !prev);
    
    // 触觉反馈
    await PlatformService.triggerHapticFeedback(HapticFeedbackType.Light);
  }, [showShareButton]);

  /**
   * 处理主按钮点击
   */
  const handleMainButtonClick = useCallback(async () => {
    if (showShareButton && onShare) {
      // 如果有分享功能，主按钮用于展开/收起
      await toggleExpanded();
    } else {
      // 否则直接保存
      await handleSave();
    }
  }, [showShareButton, onShare, toggleExpanded, handleSave]);

  return (
    <div className={`save-button-container ${className} ${isExpanded ? 'expanded' : ''}`}>
      {/* 分享按钮（仅在展开时显示） */}
      {showShareButton && onShare && isExpanded && (
        <div className="save-button-container__secondary">
          <IonFabButton
            size="small"
            color="primary"
            onClick={handleShare}
            disabled={disabled || isSaving}
            className="save-button-container__share"
          >
            <IonIcon icon={share} />
          </IonFabButton>
        </div>
      )}
      
      {/* 保存按钮（仅在展开时显示） */}
      {showShareButton && isExpanded && (
        <div className="save-button-container__secondary">
          <IonFabButton
            size="small"
            color="success"
            onClick={handleSave}
            disabled={disabled || isSaving}
            className="save-button-container__download"
          >
            <IonIcon icon={download} />
          </IonFabButton>
        </div>
      )}
      
      {/* 主按钮 */}
      <div className="save-button-container__primary">
        <IonFabButton
          color="primary"
          onClick={handleMainButtonClick}
          disabled={disabled || isSaving}
          className={`save-button-container__main ${isSaving ? 'loading' : ''}`}
        >
          <IonIcon 
            icon={isSaving ? undefined : save} 
            className={isSaving ? 'spinning' : ''}
          />
          {isSaving && (
            <div className="save-button-container__loading">
              <div className="spinner"></div>
            </div>
          )}
        </IonFabButton>
      </div>
      
      {/* 按钮标签 */}
      <div className="save-button-container__label">
        {isSaving ? '保存中...' : '保存壁纸'}
      </div>
    </div>
  );
};

export default React.memo(SaveButton);