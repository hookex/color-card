import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';

export const takeScreenshot = async (mode: 'canvas' | 'div' = 'div') => {
  try {
    let canvas: HTMLCanvasElement;
    
    if (mode === 'canvas') {
      // Canvas mode: get canvas element directly
      const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvasElement) {
        throw new Error('Canvas element not found');
      }
      canvas = canvasElement;
    } else {
      // Div mode: convert div to canvas using html2canvas
      const backgroundDiv = document.querySelector('.background') as HTMLElement;
      if (!backgroundDiv) {
        throw new Error('Background div not found');
      }
      canvas = await html2canvas(backgroundDiv, {
        backgroundColor: null,
        scale: 2, // Higher quality
      });
    }

    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
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
    const base64Data = dataUrl.split(',')[1];

    // Generate filename
    const timestamp = new Date().getTime();
    const fileName = `wallpaper_${timestamp}.png`;

    if (Capacitor.isNativePlatform()) {
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

      return { success: true, fileName };
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
