import React, { useRef, useEffect, useCallback, useState } from 'react';
import { getLuminance } from '../utils/backgroundUtils';

interface AppleLiquidGlassProps {
  width: number;
  height: number;
  backgroundColor?: string;
  borderRadius?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  isActive?: boolean;
  adaptiveMode?: 'light' | 'dark' | 'auto';
}

const AppleLiquidGlass: React.FC<AppleLiquidGlassProps> = ({
  width,
  height,
  backgroundColor = '#000000',
  borderRadius = 20,
  children,
  className,
  style,
  onClick,
  isActive = false,
  adaptiveMode = 'auto'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // 苹果液态玻璃Vertex Shader
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    varying vec2 v_position;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
      v_position = a_position;
    }
  `;

  // 苹果液态玻璃Fragment Shader - 基于真实物理的光线追踪
  const fragmentShaderSource = `
    precision highp float;
    
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec3 u_backgroundColor;
    uniform vec2 u_mouse;
    uniform float u_borderRadius;
    uniform bool u_isActive;
    uniform bool u_isPressed;
    uniform float u_adaptiveMode; // 0.0=dark, 1.0=light, 0.5=auto
    
    varying vec2 v_texCoord;
    varying vec2 v_position;
    
    const float PI = 3.14159265359;
    const float IOR = 1.52; // 玻璃折射率
    const float THICKNESS = 0.1; // 玻璃厚度
    
    // 高质量噪声函数
    vec3 hash3(vec2 p) {
      vec3 q = vec3(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3)),
        dot(p, vec2(419.2, 371.9))
      );
      return fract(sin(q) * 43758.5453);
    }
    
    float noise(vec2 x) {
      vec2 p = floor(x);
      vec2 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = hash3(p).x;
      float b = hash3(p + vec2(1.0, 0.0)).x;
      float c = hash3(p + vec2(0.0, 1.0)).x;
      float d = hash3(p + vec2(1.0, 1.0)).x;
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    // 分形布朗运动
    float fbm(vec2 x, int octaves) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      
      for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }
    
    // 圆角矩形SDF
    float roundedBoxSDF(vec2 centerPos, vec2 size, float radius) {
      return length(max(abs(centerPos) - size + radius, 0.0)) - radius;
    }
    
    // 菲涅尔反射
    float fresnel(vec3 incident, vec3 normal, float ior) {
      float cosi = clamp(-1.0, 1.0, dot(incident, normal));
      float etai = 1.0, etat = ior;
      if (cosi > 0.0) {
        float temp = etai;
        etai = etat;
        etat = temp;
      }
      
      float sint = etai / etat * sqrt(max(0.0, 1.0 - cosi * cosi));
      if (sint >= 1.0) {
        return 1.0; // 全反射
      }
      
      float cost = sqrt(max(0.0, 1.0 - sint * sint));
      cosi = abs(cosi);
      float Rs = ((etat * cosi) - (etai * cost)) / ((etat * cosi) + (etai * cost));
      float Rp = ((etai * cosi) - (etat * cost)) / ((etai * cosi) + (etat * cost));
      return (Rs * Rs + Rp * Rp) / 2.0;
    }
    
    // 折射计算
    vec3 refract(vec3 incident, vec3 normal, float ior) {
      float cosi = clamp(-1.0, 1.0, dot(incident, normal));
      float etai = 1.0, etat = ior;
      vec3 n = normal;
      if (cosi < 0.0) {
        cosi = -cosi;
      } else {
        float temp = etai;
        etai = etat;
        etat = temp;
        n = -normal;
      }
      
      float eta = etai / etat;
      float k = 1.0 - eta * eta * (1.0 - cosi * cosi);
      return k < 0.0 ? vec3(0.0) : eta * incident + (eta * cosi - sqrt(k)) * n;
    }
    
    // 液态扭曲 - 模拟玻璃表面的微小变形
    vec2 liquidDistortion(vec2 uv, float time) {
      // 主要液态波动
      float wave1 = sin(uv.x * 12.0 + time * 1.5) * cos(uv.y * 8.0 + time * 1.2);
      float wave2 = cos(uv.x * 16.0 + time * 2.1) * sin(uv.y * 14.0 + time * 1.8);
      
      // 细微扰动
      float micro = fbm(uv * 25.0 + time * 0.5, 4) * 0.3;
      
      // 组合扭曲
      vec2 distortion = vec2(wave1 + wave2 * 0.7, wave2 + wave1 * 0.6) * 0.008;
      distortion += vec2(micro) * 0.004;
      
      // 活跃状态增强
      if (u_isActive) {
        distortion *= 1.5;
      }
      
      // 按压状态的涟漪效果
      if (u_isPressed) {
        vec2 center = vec2(0.5);
        float dist = distance(uv, center);
        float ripple = sin(dist * 20.0 - time * 8.0) * exp(-dist * 5.0);
        distortion += vec2(ripple) * 0.01;
      }
      
      return distortion;
    }
    
    // 动态环境采样 - 模拟周围环境的反射
    vec3 sampleEnvironment(vec2 direction, float lod) {
      // 模拟从背景色派生的环境
      vec3 envColor = u_backgroundColor;
      
      // 根据方向调整颜色
      float gradient = dot(direction, vec2(0.707, 0.707));
      envColor = mix(envColor * 0.7, envColor * 1.3, gradient * 0.5 + 0.5);
      
      // 添加环境变化
      float envNoise = fbm(direction * 8.0 + u_time * 0.2, 3);
      envColor = mix(envColor, envColor * vec3(1.2, 1.1, 1.0), envNoise * 0.2);
      
      return envColor;
    }
    
    // 镜面高光计算
    vec3 calculateSpecular(vec2 uv, vec3 normal, vec3 viewDir) {
      // 主光源位置（跟随鼠标）
      vec3 lightPos = vec3(u_mouse.x, u_mouse.y, 0.5);
      vec3 lightDir = normalize(lightPos - vec3(uv, 0.0));
      
      // 反射向量
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
      
      // 动态高光强度
      float intensity = u_isActive ? 1.5 : 1.0;
      if (u_isPressed) intensity *= 1.2;
      
      return vec3(1.0) * spec * intensity * 0.8;
    }
    
    void main() {
      vec2 uv = v_texCoord;
      vec2 centerPos = uv - 0.5;
      
      // 圆角矩形遮罩
      float normalizedRadius = u_borderRadius / min(u_resolution.x, u_resolution.y);
      float sdf = roundedBoxSDF(centerPos, vec2(0.48), normalizedRadius);
      
      // 液态边缘扭曲
      vec2 distortion = liquidDistortion(uv, u_time);
      sdf += length(distortion) * 2.0;
      
      // 边缘渐变
      float alpha = 1.0 - smoothstep(-0.005, 0.005, sdf);
      if (alpha < 0.01) discard;
      
      // 表面法线（包含液态扭曲）
      float epsilon = 0.001;
      vec2 distortionX = liquidDistortion(uv + vec2(epsilon, 0.0), u_time);
      vec2 distortionY = liquidDistortion(uv + vec2(0.0, epsilon), u_time);
      
      vec3 normal = normalize(vec3(
        (distortion.x - distortionX.x) / epsilon,
        (distortion.y - distortionY.y) / epsilon,
        1.0
      ));
      
      // 视线方向
      vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
      
      // 折射
      vec3 refractDir = refract(-viewDir, normal, 1.0 / IOR);
      vec2 refractUV = uv + refractDir.xy * THICKNESS;
      vec3 refractedColor = sampleEnvironment(refractUV, 0.0);
      
      // 反射
      vec3 reflectDir = reflect(-viewDir, normal);
      vec3 reflectedColor = sampleEnvironment(reflectDir.xy, 1.0);
      
      // 菲涅尔混合
      float fresnelFactor = fresnel(-viewDir, normal, IOR);
      vec3 glassColor = mix(refractedColor, reflectedColor, fresnelFactor);
      
      // 添加镜面高光
      vec3 specular = calculateSpecular(uv, normal, viewDir);
      glassColor += specular;
      
      // 自适应亮度调整
      float backgroundLum = dot(u_backgroundColor, vec3(0.299, 0.587, 0.114));
      float adaptiveFactor = u_adaptiveMode;
      if (u_adaptiveMode == 0.5) { // auto mode
        adaptiveFactor = backgroundLum > 0.5 ? 0.0 : 1.0;
      }
      
      // 根据自适应模式调整颜色
      if (adaptiveFactor < 0.5) {
        // 深色模式 - 增强对比度
        glassColor = mix(glassColor * 0.8, glassColor * 1.4, fresnelFactor);
      } else {
        // 浅色模式 - 柔和处理
        glassColor = mix(glassColor * 1.1, glassColor * 0.9, fresnelFactor);
      }
      
      // 边缘发光
      float edgeGlow = 1.0 - smoothstep(0.0, 0.02, abs(sdf));
      glassColor += vec3(1.0) * edgeGlow * edgeGlow * 0.3;
      
      // 最终透明度
      float finalAlpha = alpha * (0.85 + fresnelFactor * 0.15);
      
      gl_FragColor = vec4(glassColor, finalAlpha);
    }
  `;

  // Shader创建和程序设置（与之前相同）
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
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

  const createProgram = useCallback((gl: WebGLRenderingContext) => {
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
      antialias: true,
      preserveDrawingBuffer: false
    });
    
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;
    const program = createProgram(gl);
    if (!program) return;
    
    programRef.current = program;

    // 设置顶点数据
    const vertices = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }, [createProgram]);

  // 渲染函数
  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    
    if (!canvas || !gl || !program) return;

    const dpr = window.devicePixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    // 解析背景颜色
    const r = parseInt(backgroundColor.slice(1, 3), 16) / 255;
    const g = parseInt(backgroundColor.slice(3, 5), 16) / 255;
    const b = parseInt(backgroundColor.slice(5, 7), 16) / 255;

    // 设置uniforms
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), timestamp * 0.001);
    gl.uniform3f(gl.getUniformLocation(program, 'u_backgroundColor'), r, g, b);
    gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mousePos.x, mousePos.y);
    gl.uniform1f(gl.getUniformLocation(program, 'u_borderRadius'), borderRadius);
    gl.uniform1i(gl.getUniformLocation(program, 'u_isActive'), isActive ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_isPressed'), isPressed ? 1 : 0);
    
    // 自适应模式
    let adaptiveModeValue = 0.5; // auto
    if (adaptiveMode === 'dark') adaptiveModeValue = 0.0;
    else if (adaptiveMode === 'light') adaptiveModeValue = 1.0;
    gl.uniform1f(gl.getUniformLocation(program, 'u_adaptiveMode'), adaptiveModeValue);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animationRef.current = requestAnimationFrame(render);
  }, [width, height, backgroundColor, borderRadius, mousePos, isActive, isPressed, adaptiveMode]);

  // 鼠标跟踪
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: (event.clientX - rect.left) / rect.width,
        y: 1.0 - (event.clientY - rect.top) / rect.height
      });
    }
  }, []);

  // 触摸事件
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  useEffect(() => {
    initWebGL();
    render(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initWebGL, render]);

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
      onMouseMove={handleMouseMove}
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

export default AppleLiquidGlass;