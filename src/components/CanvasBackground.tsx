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
} from '@babylonjs/core';
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
  const sphereRef = useRef<any>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const materialRef = useRef<StandardMaterial | PBRMaterial | null>(null);

  const state = useBackground(color, texture, debug);

  // 更新材质
  const updateMaterial = () => {
    if (!sceneRef.current || !materialRef.current) return;

    const newMaterial = createMaterialByType(sceneRef.current, state.color, state.texture);
    const oldMaterial = materialRef.current;

    // 创建颜色过渡动画
    if (oldMaterial instanceof StandardMaterial && newMaterial instanceof StandardMaterial) {
      oldMaterial.diffuseColor = newMaterial.diffuseColor;
    } else if (oldMaterial instanceof PBRMaterial && newMaterial instanceof PBRMaterial) {
      oldMaterial.albedoColor = newMaterial.albedoColor;
    } else {
      // 如果材质类型不同，直接替换
      if (sphereRef.current) {
        sphereRef.current.material = newMaterial;
        materialRef.current = newMaterial;
      }
    }
  };

  // 初始化3D场景
  const initScene = () => {
    if (!canvasRef.current) return;

    // 创建引擎
    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    // 创建场景
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // 设置场景
    setupScene(scene);

    // 设置相机
    const camera = setupCamera(scene);
    cameraRef.current = camera;

    // 设置灯光
    setupLights(scene);

    // 创建球体
    const sphere = MeshBuilder.CreateSphere(
      'sphere',
      { diameter: 2, segments: 32 },
      scene
    );
    sphereRef.current = sphere;
    sphere.position = Vector3.Zero();

    // 创建初始材质
    const newMaterial = createMaterialByType(scene, state.color, state.texture);
    materialRef.current = newMaterial;
    sphere.material = newMaterial;

    // 添加辉光效果
    const gl = new GlowLayer('glow', scene);
    gl.intensity = 0.5;

    // 渲染循环
    engine.runRenderLoop(() => {
      scene.render();
    });

    // 自适应窗口大小
    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
      window.removeEventListener('resize', () => {
        engine.resize();
      });
    };
  };

  // 初始化场景
  useEffect(() => {
    const cleanup = initScene();
    return () => {
      cleanup?.();
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
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
};

export default CanvasBackground;
