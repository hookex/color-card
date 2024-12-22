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
} from '@babylonjs/core';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import { TextureType } from './TextureTools';
import { useBackground } from '../hooks/useBackground';
import {
  createMaterialByType,
  setupCamera,
  setupLights,
  setupScene,
} from '../utils/canvasBackgroundUtils';
import useStore from '../stores/useStore';

const CanvasBackground: React.FC = () => {
  const color = useStore(state => state.color);
  const texture = useStore(state => state.texture);
  const debug = useStore(state => state.debug);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const planeRef = useRef<any>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const materialRef = useRef<StandardMaterial | PBRMaterial | null>(null);

  const state = useBackground(color, texture, debug);

  // 更新材质
  const updateMaterial = () => {
    if (!sceneRef.current || !planeRef.current) return;

    const newMaterial = createMaterialByType(sceneRef.current, state.color, state.texture);
    
    // 直接应用新材质
    planeRef.current.material = newMaterial;
    materialRef.current = newMaterial;
    
    // 确保场景重新渲染
    sceneRef.current.markAllMaterialsAsDirty();
  };

  // 更新相机控制
  useEffect(() => {
    if (!cameraRef.current || !canvasRef.current) return;
    
    if (state.debug) {
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
  }, [state.debug]);

  // 初始化3D场景
  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化引擎和场景
    const engine = new Engine(canvasRef.current, true, { 
      preserveDrawingBuffer: true, 
      stencil: true,
      antialias: true
    });
    engineRef.current = engine;

    // 初始化场景
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // 设置场景
    setupScene(scene);
    
    // 设置相机
    const camera = setupCamera(scene);
    cameraRef.current = camera;

    if (!state.debug) {
      camera.detachControl();
    }
    
    // 设置灯光
    setupLights(scene);

    // 创建平面
    const plane = MeshBuilder.CreatePlane('colorPlane', {
      size: 2,  
      sideOrientation: Mesh.DOUBLESIDE
    }, scene);
    plane.rotation = new Vector3(0, 0, 0);
    planeRef.current = plane;

    // 创建并应用材质
    const material = createMaterialByType(scene, state.color, state.texture);
    plane.material = material;
    materialRef.current = material;

    // 添加辉光效果
    const gl = new GlowLayer('glow', scene);
    gl.intensity = 0.5;

    // 在调试模式下启用 Inspector
    if (state.debug) {
      scene.debugLayer.show({
        embedMode: true,
        handleResize: true,
        overlay: true,
      });
    }

    // 渲染循环
    engine.runRenderLoop(() => {
      scene.render();
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
      engine.dispose();
      scene.dispose();
    };
  }, []);

  // 更新材质
  useEffect(() => {
    updateMaterial();
  }, [state.color, state.texture]);

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
