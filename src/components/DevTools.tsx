import React, { useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonFabList, IonToast } from '@ionic/react';
import { 
  buildOutline, 
  languageOutline, 
  cameraOutline, 
  cubeOutline, 
  layersOutline,
  brushOutline,
  squareOutline 
} from 'ionicons/icons';
import { Inspector } from 'react-dev-inspector';
import { useTranslation } from 'react-i18next';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';
import './DevTools.scss';

const InspectorWrapper = Inspector;

/**
 * DevTools 组件属性接口
 * @interface Props
 * @property {React.ReactNode} [children] - 子组件
 * @property {boolean} [debug] - 调试模式状态
 * @property {(debug: boolean) => void} [onDebugChange] - 调试模式切换回调
 * @property {'canvas' | 'div'} [mode] - 背景渲染模式
 * @property {(mode: 'canvas' | 'div') => void} [onModeChange] - 背景模式切换回调
 */
interface Props {
  children?: React.ReactNode;
  debug?: boolean;
  onDebugChange?: (debug: boolean) => void;
  mode?: 'canvas' | 'div';
  onModeChange?: (mode: 'canvas' | 'div') => void;
}

const DevTools: React.FC<Props> = ({ children, debug = false, onDebugChange, mode = 'canvas', onModeChange }) => {
  const { i18n } = useTranslation();
  const [showInspector, setShowInspector] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 切换调试器
  const toggleInspector = () => {
    setShowInspector(!showInspector);
  };

  // 切换语言
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  // 切换3D调试模式
  const toggle3DMode = () => {
    if (onDebugChange) {
      onDebugChange(!debug);
    }
  };

  // 保存到相册
  const saveToGallery = async (base64Data: string, fileName: string) => {
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });

      const savedFile = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Cache
      });

      await Filesystem.copy({
        from: savedFile.uri,
        to: `PHOTO_${new Date().getTime()}.png`,
        directory: Directory.ExternalStorage,
        toDirectory: Directory.External
      });

      setToastMessage('Wallpaper saved to gallery');
      setShowToast(true);
    } catch (error) {
      console.error('Save to gallery error:', error);
      throw error;
    }
  };

  // 浏览器中下载
  const downloadInBrowser = (dataUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      setToastMessage('Wallpaper downloaded');
      setShowToast(true);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  // 截图
  const takeScreenshot = async () => {
    try {
      let canvas: HTMLCanvasElement;
      
      if (mode === 'canvas') {
        // Canvas 模式：直接获取 canvas 元素
        const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
        if (!canvasElement) {
          throw new Error('Canvas element not found');
        }
        canvas = canvasElement;
      } else {
        // Div 模式：使用 html2canvas 将 div 转换为 canvas
        const backgroundDiv = document.querySelector('.background') as HTMLElement;
        if (!backgroundDiv) {
          throw new Error('Background div not found');
        }
        canvas = await html2canvas(backgroundDiv, {
          backgroundColor: null,
          scale: 2, // 提高截图质量
        });
      }

      // 创建一个临时画布
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // 设置 iPhone 壁纸尺寸
      tempCanvas.width = 1170;
      tempCanvas.height = 2532;

      // 填充背景色（可选，防止透明）
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // 计算缩放和位置以保持宽高比
      const scale = Math.max(
        tempCanvas.width / canvas.width,
        tempCanvas.height / canvas.height
      );
      
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;
      const x = (tempCanvas.width - scaledWidth) / 2;
      const y = (tempCanvas.height - scaledHeight) / 2;

      // 绘制并缩放原始画布内容
      ctx.drawImage(
        canvas,
        x, y,
        scaledWidth,
        scaledHeight
      );

      // 获取图片数据
      const dataUrl = tempCanvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];

      // 生成文件名
      const timestamp = new Date().getTime();
      const fileName = `wallpaper_${timestamp}.png`;

      if (Capacitor.isNativePlatform()) {
        await saveToGallery(base64Data, fileName);
      } else {
        downloadInBrowser(dataUrl, fileName);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      setToastMessage('Failed to take screenshot');
      setShowToast(true);
    }
  };

  return (
    <>
      {showInspector ? (
        <InspectorWrapper
          keys={['control', 'shift', 'command', 'c']}
          disableLaunchEditor={false}
          onHoverElement={() => {}}
        >
          {children}
        </InspectorWrapper>
      ) : (
        children
      )}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton>
          <IonIcon icon={buildOutline} />
        </IonFabButton>
        <IonFabList side="top">
          {/* 调试器按钮 */}
          <IonFabButton onClick={toggleInspector}>
            <IonIcon icon={cubeOutline} />
          </IonFabButton>
          {/* 语言切换按钮 */}
          <IonFabButton onClick={toggleLanguage}>
            <IonIcon icon={languageOutline} />
          </IonFabButton>
          {/* 截图按钮 */}
          <IonFabButton onClick={takeScreenshot}>
            <IonIcon icon={cameraOutline} />
          </IonFabButton>
          {/* 背景模式切换按钮 */}
          <IonFabButton 
            onClick={() => onModeChange?.(mode === 'canvas' ? 'div' : 'canvas')}
            className={mode === 'canvas' ? 'bg-primary' : 'bg-orange-600'}
          >
            <IonIcon icon={mode === 'canvas' ? brushOutline : squareOutline} />
          </IonFabButton>
          {/* 3D调试模式按钮 */}
          <IonFabButton onClick={toggle3DMode} className={debug ? 'bg-primary' : 'bg-orange-600'}>
            <IonIcon icon={cubeOutline} />
          </IonFabButton>
        </IonFabList>
      </IonFab>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
        color={toastMessage.includes('Failed') ? 'danger' : 'success'}
      />
    </>
  );
};

export default DevTools;
