import React, { useRef, useEffect, useCallback, useState } from 'react';
import { getLuminance } from '../utils/backgroundUtils';

interface LiquidGlassCanvasProps {
  width: number;
  height: number;
  backgroundColor?: string;
  borderRadius?: number;
  blur?: number;
  opacity?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
  onClick?: () => void;
  isActive?: boolean;
  touchEffect?: boolean;
}

const LiquidGlassCanvas: React.FC<LiquidGlassCanvasProps> = ({
  width,
  height,
  backgroundColor = '#000000',
  borderRadius = 20,
  blur = 20,
  opacity = 0.7,
  children,
  className,
  style,
  animated = true,
  onClick,
  isActive = false,
  touchEffect = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isPressed, setIsPressed] = useState(false);

  // 生成液态玻璃形状的路径
  const generateLiquidPath = useCallback((
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    radius: number,
    time: number = 0
  ) => {
    ctx.beginPath();
    
    // 基础圆角矩形，添加液态波动效果
    const waveAmplitude = animated ? 2 + Math.sin(time * 0.002) * 1 : 0;
    const waveFreq = 0.1;
    
    // 左上角
    ctx.moveTo(radius, 0);
    
    // 顶边（添加轻微波动）
    for (let x = radius; x < w - radius; x += 5) {
      const wave = Math.sin(x * waveFreq + time * 0.003) * waveAmplitude;
      ctx.lineTo(x, wave);
    }
    
    // 右上角
    ctx.lineTo(w - radius, 0);
    ctx.quadraticCurveTo(w, 0, w, radius);
    
    // 右边
    for (let y = radius; y < h - radius; y += 5) {
      const wave = Math.sin(y * waveFreq + time * 0.002) * waveAmplitude;
      ctx.lineTo(w - wave, y);
    }
    
    // 右下角
    ctx.lineTo(w, h - radius);
    ctx.quadraticCurveTo(w, h, w - radius, h);
    
    // 底边
    for (let x = w - radius; x > radius; x -= 5) {
      const wave = Math.sin(x * waveFreq + time * 0.004) * waveAmplitude;
      ctx.lineTo(x, h - wave);
    }
    
    // 左下角
    ctx.lineTo(radius, h);
    ctx.quadraticCurveTo(0, h, 0, h - radius);
    
    // 左边
    for (let y = h - radius; y > radius; y -= 5) {
      const wave = Math.sin(y * waveFreq + time * 0.003) * waveAmplitude;
      ctx.lineTo(wave, y);
    }
    
    // 左上角完成
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    
    ctx.closePath();
  }, [animated]);

  // 绘制液态玻璃效果
  const drawLiquidGlass = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 只在必要时重新设置画布尺寸
    const dpr = window.devicePixelRatio;
    const displayWidth = width;
    const displayHeight = height;
    const canvasWidth = displayWidth * dpr;
    const canvasHeight = displayHeight * dpr;

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = displayWidth + 'px';
      canvas.style.height = displayHeight + 'px';
      ctx.scale(dpr, dpr);
    }

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 创建液态形状路径
    generateLiquidPath(ctx, width, height, borderRadius, timestamp);

    // 保存当前状态
    ctx.save();

    // 裁剪到液态形状
    ctx.clip();

    // 解析背景颜色
    const luminance = getLuminance(backgroundColor);
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);

    // 创建背景渐变
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const alpha = isActive ? opacity * 1.2 : opacity;
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.9})`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);

    // 填充背景
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 添加光泽效果
    const glossGradient = ctx.createLinearGradient(0, 0, 0, height);
    glossGradient.addColorStop(0, `rgba(255, 255, 255, ${luminance > 0.5 ? 0.3 : 0.5})`);
    glossGradient.addColorStop(0.3, `rgba(255, 255, 255, 0.1)`);
    glossGradient.addColorStop(0.7, `rgba(255, 255, 255, 0.05)`);
    glossGradient.addColorStop(1, `rgba(255, 255, 255, 0.2)`);

    ctx.fillStyle = glossGradient;
    ctx.fillRect(0, 0, width, height);

    // 添加动态高光点
    if (animated && isActive) {
      const highlightX = (Math.sin(timestamp * 0.0008) + 1) * width * 0.4 + width * 0.1;
      const highlightY = height * 0.15 + Math.cos(timestamp * 0.0006) * height * 0.1;
      const highlightRadius = 25 + Math.sin(timestamp * 0.001) * 5;

      const highlightGradient = ctx.createRadialGradient(
        highlightX, highlightY, 0,
        highlightX, highlightY, highlightRadius
      );
      highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${isActive ? 0.4 : 0.2})`);
      highlightGradient.addColorStop(0.6, `rgba(255, 255, 255, 0.1)`);
      highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.fillStyle = highlightGradient;
      ctx.fillRect(0, 0, width, height);

      // 添加第二个高光点
      const highlight2X = width - highlightX;
      const highlight2Y = height - highlightY;
      const highlight2Radius = highlightRadius * 0.6;

      const highlight2Gradient = ctx.createRadialGradient(
        highlight2X, highlight2Y, 0,
        highlight2X, highlight2Y, highlight2Radius
      );
      highlight2Gradient.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
      highlight2Gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.fillStyle = highlight2Gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // 恢复状态
    ctx.restore();

    // 绘制边框
    generateLiquidPath(ctx, width, height, borderRadius, timestamp);
    ctx.strokeStyle = `rgba(255, 255, 255, ${isActive ? 0.3 : 0.15})`;
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.stroke();

    // 继续动画
    if (animated) {
      animationRef.current = requestAnimationFrame(drawLiquidGlass);
    }
  }, [width, height, backgroundColor, borderRadius, opacity, generateLiquidPath, animated, isActive]);

  // 初始化和清理
  useEffect(() => {
    drawLiquidGlass(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawLiquidGlass]);

  // 处理触摸事件
  const handleMouseDown = () => {
    if (touchEffect) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    if (touchEffect) {
      setIsPressed(false);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        cursor: onClick ? 'pointer' : 'default',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s ease',
        ...style
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          filter: `blur(${blur}px)`,
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LiquidGlassCanvas;