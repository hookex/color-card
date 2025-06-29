import React, { useRef, useEffect, useCallback, useState } from 'react';
import { getLuminance } from '../utils/backgroundUtils';

interface LiquidGlassWebGLProps {
  width: number;
  height: number;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
  onClick?: () => void;
  isActive?: boolean;
  intensity?: number;
}

const LiquidGlassWebGL: React.FC<LiquidGlassWebGLProps> = ({
  width,
  height,
  backgroundColor = '#000000',
  borderRadius = 20,
  opacity = 0.7,
  children,
  className,
  style,
  animated = true,
  onClick,
  isActive = false,
  intensity = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Vertex shader - 简单的全屏四边形
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  // Fragment shader - 液态玻璃效果
  const fragmentShaderSource = `
    precision mediump float;
    
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec3 u_color;
    uniform float u_opacity;
    uniform float u_borderRadius;
    uniform float u_intensity;
    uniform bool u_isActive;
    
    varying vec2 v_texCoord;
    
    // 噪声函数
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    // 分形噪声
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 0.0;
      
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    // 圆角矩形SDF
    float roundedBoxSDF(vec2 centerPosition, vec2 size, float radius) {
      return length(max(abs(centerPosition) - size + radius, 0.0)) - radius;
    }
    
    // 液态扭曲函数
    vec2 liquidDistortion(vec2 uv, float time) {
      float speed = 0.3;
      vec2 distortion = vec2(
        sin(uv.y * 8.0 + time * speed) * 0.02,
        cos(uv.x * 6.0 + time * speed * 1.3) * 0.015
      );
      
      // 添加更复杂的液态流动
      distortion += vec2(
        fbm(uv * 3.0 + time * 0.1) * 0.01,
        fbm(uv * 4.0 + time * 0.15) * 0.008
      );
      
      return distortion * u_intensity;
    }
    
    // 折射效果
    vec3 refraction(vec2 uv, float time) {
      vec2 distortedUV = uv + liquidDistortion(uv, time);
      
      // 创建类似玻璃的折射效果
      float refractIndex = 1.0 + 0.1 * sin(time * 2.0 + uv.x * 10.0);
      vec2 refractedUV = uv + (distortedUV - uv) * refractIndex;
      
      // 基础颜色
      vec3 baseColor = u_color;
      
      // 添加彩虹色散效果
      float dispersion = 0.02 * u_intensity;
      vec3 dispersedColor = vec3(
        baseColor.r + sin(refractedUV.x * 20.0 + time) * dispersion,
        baseColor.g + sin(refractedUV.y * 15.0 + time * 1.1) * dispersion,
        baseColor.b + sin((refractedUV.x + refractedUV.y) * 12.0 + time * 0.9) * dispersion
      );
      
      return dispersedColor;
    }
    
    // 高光计算
    float calculateHighlight(vec2 uv, float time) {
      // 主高光
      vec2 lightPos = vec2(
        0.3 + 0.2 * sin(time * 0.8),
        0.2 + 0.1 * cos(time * 0.6)
      );
      float lightDist = distance(uv, lightPos);
      float highlight = 1.0 / (1.0 + lightDist * 8.0);
      highlight = pow(highlight, 3.0);
      
      // 次要高光
      vec2 light2Pos = vec2(
        0.7 + 0.15 * cos(time * 1.2),
        0.8 + 0.1 * sin(time * 0.9)
      );
      float light2Dist = distance(uv, light2Pos);
      float highlight2 = 1.0 / (1.0 + light2Dist * 12.0);
      highlight2 = pow(highlight2, 4.0);
      
      return highlight + highlight2 * 0.6;
    }
    
    void main() {
      vec2 uv = v_texCoord;
      vec2 centerPos = uv - 0.5;
      
      // 圆角矩形边界
      float normalizedRadius = u_borderRadius / min(u_resolution.x, u_resolution.y);
      float sdf = roundedBoxSDF(centerPos, vec2(0.45), normalizedRadius);
      
      // 液态边缘扭曲
      float edgeDistortion = liquidDistortion(uv, u_time).x * 2.0;
      sdf += edgeDistortion;
      
      // 边缘平滑
      float alpha = 1.0 - smoothstep(-0.01, 0.01, sdf);
      
      if (alpha < 0.01) {
        discard;
      }
      
      // 获取折射后的颜色
      vec3 glassColor = refraction(uv, u_time);
      
      // 计算高光
      float highlight = calculateHighlight(uv, u_time);
      if (u_isActive) {
        highlight *= 1.5;
      }
      
      // 边缘发光效果
      float edgeGlow = 1.0 - smoothstep(0.0, 0.1, abs(sdf));
      edgeGlow = pow(edgeGlow, 2.0);
      
      // 组合最终颜色
      vec3 finalColor = glassColor;
      finalColor += vec3(1.0) * highlight * 0.3;
      finalColor += vec3(1.0) * edgeGlow * 0.2;
      
      // 活跃状态额外效果
      if (u_isActive) {
        float pulse = 0.5 + 0.5 * sin(u_time * 3.0);
        finalColor += vec3(0.1) * pulse;
      }
      
      gl_FragColor = vec4(finalColor, alpha * u_opacity);
    }
  `;

  // 创建shader
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }, []);

  // 创建program
  const createProgram = useCallback((gl: WebGLRenderingContext): WebGLProgram | null => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }, [createShader, vertexShaderSource, fragmentShaderSource]);

  // 初始化WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false,
      antialias: true 
    });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;
    const program = createProgram(gl);
    if (!program) return;
    
    programRef.current = program;

    // 设置顶点数据（全屏四边形）
    const vertices = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 设置属性
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texCoordLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    // 启用混合
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }, [createProgram]);

  // 渲染函数
  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    
    if (!canvas || !gl || !program) return;

    // 设置viewport
    const dpr = window.devicePixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // 解析颜色
    const r = parseInt(backgroundColor.slice(1, 3), 16) / 255;
    const g = parseInt(backgroundColor.slice(3, 5), 16) / 255;
    const b = parseInt(backgroundColor.slice(5, 7), 16) / 255;

    // 设置uniforms
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const opacityLocation = gl.getUniformLocation(program, 'u_opacity');
    const borderRadiusLocation = gl.getUniformLocation(program, 'u_borderRadius');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
    const isActiveLocation = gl.getUniformLocation(program, 'u_isActive');

    gl.uniform2f(resolutionLocation, width, height);
    gl.uniform1f(timeLocation, timestamp * 0.001);
    gl.uniform3f(colorLocation, r, g, b);
    gl.uniform1f(opacityLocation, opacity);
    gl.uniform1f(borderRadiusLocation, borderRadius);
    gl.uniform1f(intensityLocation, isPressed ? intensity * 1.5 : intensity);
    gl.uniform1i(isActiveLocation, isActive ? 1 : 0);

    // 绘制
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (animated || isActive) {
      animationRef.current = requestAnimationFrame(render);
    }
  }, [width, height, backgroundColor, borderRadius, opacity, intensity, isActive, isPressed, animated]);

  // 初始化和清理
  useEffect(() => {
    initWebGL();
    render(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initWebGL, render]);

  // 触摸事件处理
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        cursor: onClick ? 'pointer' : 'default',
        transform: isPressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style
      }}
      onClick={onClick}
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
          boxSizing: 'border-box',
          pointerEvents: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LiquidGlassWebGL;