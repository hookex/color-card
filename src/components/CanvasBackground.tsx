import React, { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  ArcRotateCamera,
  HemisphericLight,
  PBRMaterial,
  PointLight,
  GlowLayer,
  Mesh,
  Texture,
  Material,
} from '@babylonjs/core';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import { TextureType } from '../stores/slices/textureSlice';
import {
  createMaterialByType,
  setupCamera,
  setupLights,
  setupScene,
} from '../utils/canvasBackgroundUtils';
import { useAppStoreSelectors } from '../stores/useAppStore';
import backgroundImage from '../assets/background.jpg';

const CanvasBackground: React.FC = () => {
  const color = useAppStoreSelectors.useColor();
  const texture = useAppStoreSelectors.useTexture();
  const debug = useAppStoreSelectors.useDebug();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const planeRef = useRef<Mesh | null>(null);
  const materialRef = useRef<Material | null>(null);
  const backgroundPlaneRef = useRef<Mesh | null>(null);

  // 更新材质
  const updateMaterial = () => {
    if (!sceneRef.current || !planeRef.current) return;
    
    // 确保有默认颜色
    const currentColor = color || '#ff6b6b';
    const currentTexture = texture || 'paint';

    try {
      const newMaterial = createMaterialByType(sceneRef.current, currentColor, currentTexture);
      
      if (newMaterial) {
        // 直接应用新材质
        planeRef.current.material = newMaterial;
        materialRef.current = newMaterial;
        
        // 确保材质准备就绪
        if (newMaterial.isReady(planeRef.current) && sceneRef.current) {
          sceneRef.current.render();
        }
      }
      
      // 同时更新背景平面颜色
      if (backgroundPlaneRef.current && backgroundPlaneRef.current.material) {
        const bgMaterial = backgroundPlaneRef.current.material as StandardMaterial;
        bgMaterial.diffuseColor = Color3.FromHexString(currentColor);
      }
      
      // 确保场景重新渲染
      sceneRef.current.markAllMaterialsAsDirty(1);
    } catch (error) {
      console.error('Error updating material:', error);
      // 备用方案：创建简单材质
      const fallbackMaterial = new StandardMaterial('fallback', sceneRef.current);
      fallbackMaterial.diffuseColor = Color3.FromHexString(currentColor);
      planeRef.current.material = fallbackMaterial;
    }
  };

  // 更新相机控制
  useEffect(() => {
    if (!cameraRef.current || !canvasRef.current) return;
    
    if (debug) {
      cameraRef.current.attachControl(canvasRef.current, true);
      cameraRef.current.lowerRadiusLimit = 2;
      cameraRef.current.upperRadiusLimit = 10;
      cameraRef.current.wheelDeltaPercentage = 0.01;
    } else {
      cameraRef.current.detachControl();
      // 重置相机位置
      cameraRef.current.setPosition(new Vector3(0, 0, 5));
      cameraRef.current.setTarget(Vector3.Zero());
    }
  }, [debug]);

  // 初始化3D场景
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.style.pointerEvents = 'none';  // 禁用 canvas 的鼠标事件

    // 初始化引擎和场景
    const engine = new Engine(canvas, true, { 
      preserveDrawingBuffer: true, 
      stencil: true,
      antialias: false, // 关闭抗锯齿以提高性能
      adaptToDeviceRatio: false, // 不随设备像素比缩放
    });
    engineRef.current = engine;

    // 初始化场景
    const scene = new Scene(engine);
    // 设置初始背景色（使用当前颜色或默认颜色）
    const currentColor = color || '#ff6b6b';
    const bgColor = Color3.FromHexString(currentColor);
    scene.clearColor = new Color4(bgColor.r, bgColor.g, bgColor.b, 1.0); // 不透明背景
    scene.autoClear = true; // 启用自动清除确保渲染正确
    scene.skipPointerMovePicking = true; // 禁用指针移动拾取以提高性能
    sceneRef.current = scene;

    // 设置场景
    setupScene(scene);
    
    // 设置相机
    const camera = setupCamera(scene);
    cameraRef.current = camera;

    if (!debug) {
      camera.detachControl();
    }
    
    // 设置灯光
    setupLights(scene);

    // 创建背景平面（图片，在前面）
    const backgroundPlane = MeshBuilder.CreatePlane('backgroundPlane', {
      size: 8,  // 增大图片平面尺寸
      sideOrientation: Mesh.DOUBLESIDE
    }, scene);
    backgroundPlane.position = new Vector3(0, 0, 2);  // 放在前面
    backgroundPlaneRef.current = backgroundPlane;

    // 创建背景材质（使用纯色）
    const backgroundMaterial = new StandardMaterial('backgroundMaterial', scene);
    // 确保有默认颜色
    backgroundMaterial.diffuseColor = Color3.FromHexString(currentColor);
    backgroundMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
    backgroundMaterial.emissiveColor = new Color3(0.1, 0.1, 0.1); // 添加发光确保可见
    backgroundPlane.material = backgroundMaterial;

    // 创建主平面（玻璃效果，在后面）
    const plane = MeshBuilder.CreatePlane('colorPlane', {
      size: 2,  // 减小玻璃平面尺寸
      sideOrientation: Mesh.DOUBLESIDE
    }, scene);
    plane.position = new Vector3(0, 0, -2);  // 放在后面
    planeRef.current = plane;

    // 创建并应用材质（延迟确保所有资源就绪）
    setTimeout(() => {
      updateMaterial();
      // 强制渲染一帧确保显示
      if (sceneRef.current) {
        sceneRef.current.render();
      }
    }, 100);

    // 添加辉光效果
    const gl = new GlowLayer('glow', scene);
    gl.intensity = 0.5;

    // 在调试模式下启用 Inspector
    if (debug) {
      scene.debugLayer.show({
        embedMode: true,
        handleResize: true,
        overlay: true,
      });
    }

    // 优化渲染循环
    engine.runRenderLoop(() => {
      if (scene.activeCamera) {
        scene.render();
      }
    });

    // 处理窗口大小变化
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        engine.resize();
      }
    };

    // 初始设置画布大小
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, []);

  // 更新材质和场景背景色
  useEffect(() => {
    if (!sceneRef.current || !planeRef.current) return;
    updateMaterial();
    
    // 同时更新场景背景色
    const currentColor = color || '#ff6b6b';
    const bgColor = Color3.FromHexString(currentColor);
    sceneRef.current.clearColor = new Color4(bgColor.r, bgColor.g, bgColor.b, 1.0);
  }, [color, texture]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        display: 'block',
        touchAction: 'none'
      }}
    />
  );
};

export default CanvasBackground;
