import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';

// 定义返回类型
type ScreenshotResult = 
  | { success: true; fileName: string }
  | { success: false; error: unknown };

// 检查权限（在 iOS 上不需要显式请求文件系统权限）
async function checkPermissions() {
  if (!Capacitor.isNativePlatform()) return true;
  
  if (Capacitor.getPlatform() === 'ios') {
    return true; // iOS 通过 Info.plist 处理权限
  }
  
  // Android 权限在保存时会自动请求
  return true;
}

// 预览并保存图片
async function previewAndSave(base64Data: string, fileName: string): Promise<ScreenshotResult> {
  if (Capacitor.getPlatform() === 'ios') {
    try {
      // 先保存到临时目录
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      // 获取临时文件的 URI
      const fileUri = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Cache
      });

      // 使用 Share API 预览
      await Share.share({
        title: '预览壁纸',
        url: fileUri.uri,
        dialogTitle: '预览并保存壁纸'
      });

      return { success: true, fileName };
    } catch (error) {
      console.error('Preview failed:', error);
      return { success: false, error };
    }
  } else {
    try {
      // 非 iOS 平台直接保存
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });
      
      return { success: true, fileName };
    } catch (error) {
      console.error('Save failed:', error);
      return { success: false, error };
    }
  }
}

export const takeScreenshot = async (mode: 'canvas' | 'div' = 'div'): Promise<ScreenshotResult> => {
  try {
    // 首先检查权限
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      return { success: false, error: 'Storage permission not granted' };
    }

    let canvas: HTMLCanvasElement;
    
    if (mode === 'canvas') {
      // Canvas mode: get canvas element directly
      const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvasElement) {
        return { success: false, error: 'Canvas element not found' };
      }
      canvas = canvasElement;
    } else {
      // Div mode: convert div to canvas using html2canvas
      const backgroundDiv = document.querySelector('.background') as HTMLElement;
      if (!backgroundDiv) {
        return { success: false, error: 'Background div not found' };
      }
      
      // 创建一个克隆的元素用于截图
      const clonedDiv = backgroundDiv.cloneNode(true) as HTMLElement;
      clonedDiv.style.position = 'absolute';
      clonedDiv.style.top = '-9999px';
      clonedDiv.style.left = '-9999px';
      document.body.appendChild(clonedDiv);
      
      try {
        canvas = await html2canvas(clonedDiv, {
          backgroundColor: null,
          scale: 2, // Higher quality
          logging: false,
          allowTaint: true,
          useCORS: true,
          width: backgroundDiv.offsetWidth,
          height: backgroundDiv.offsetHeight
        });
      } finally {
        // 清理克隆的元素
        document.body.removeChild(clonedDiv);
      }
    }

    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.style.position = 'absolute';
    tempCanvas.style.top = '-9999px';
    tempCanvas.style.left = '-9999px';
    document.body.appendChild(tempCanvas);
    
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) {
      document.body.removeChild(tempCanvas);
      return { success: false, error: 'Failed to get canvas context' };
    }

    // Set iPhone wallpaper dimensions
    tempCanvas.width = 1170;
    tempCanvas.height = 2532;

    // Fill background (optional, prevents transparency)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Calculate scaling to maintain aspect ratio
    const scale = Math.max(
      tempCanvas.width / canvas.width,
      tempCanvas.height / canvas.height
    );
    
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    const x = (tempCanvas.width - scaledWidth) / 2;
    const y = (tempCanvas.height - scaledHeight) / 2;

    // Draw and scale the original canvas content
    ctx.drawImage(
      canvas,
      x, y,
      scaledWidth,
      scaledHeight
    );

    // Get image data
    const dataUrl = tempCanvas.toDataURL('image/png');
    
    // Clean up
    document.body.removeChild(tempCanvas);
    
    const base64Data = dataUrl.split(',')[1];

    // Generate filename
    const timestamp = new Date().getTime();
    const fileName = `wallpaper_${timestamp}.png`;

    if (Capacitor.isNativePlatform()) {
      return await previewAndSave(base64Data, fileName);
    } else {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      return { success: true, fileName };
    }
  } catch (error) {
    console.error('Failed to take screenshot:', error);
    return { success: false, error };
  }
};
