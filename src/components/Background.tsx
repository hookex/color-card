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
  Texture,
  PBRMaterial,
  CubeTexture,
} from '@babylonjs/core';
import { TextureType } from './TextureTools';

interface Props {
  color: string;
  texture: TextureType;
  onSceneReady?: (scene: Scene) => void;
}

const Background: React.FC<Props> = ({ color, texture }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const sphereRef = useRef<any>(null);

  // 将十六进制颜色转换为 Babylon Color3
  const hexToColor3 = (hex: string): Color3 => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new Color3(r, g, b);
  };

  // 创建纯色材质
  const createSolidMaterial = (scene: Scene, color: string): StandardMaterial => {
    const material = new StandardMaterial('solidMaterial', scene);
    material.diffuseColor = hexToColor3(color);
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    material.emissiveColor = hexToColor3(color).scale(0.3);
    material.backFaceCulling = false;
    return material;
  };

  // 创建皮革材质
  const createLeatherMaterial = (scene: Scene, color: string): PBRMaterial => {
    const material = new PBRMaterial('leatherMaterial', scene);
    material.albedoColor = hexToColor3(color);
    material.metallic = 0;
    material.roughness = 0.8;
    material.bumpTexture = new Texture('/assets/textures/leather_normal.jpg', scene);
    material.microSurfaceTexture = new Texture('/assets/textures/leather_roughness.jpg', scene);
    material.backFaceCulling = false;
    return material;
  };

  // 创建车漆材质
  const createCarPaintMaterial = (scene: Scene, color: string): PBRMaterial => {
    const material = new PBRMaterial('carPaintMaterial', scene);
    material.albedoColor = hexToColor3(color);
    material.metallic = 0.8;
    material.roughness = 0.2;
    material.clearCoat.isEnabled = true;
    material.clearCoat.intensity = 1;
    material.clearCoat.roughness = 0.1;
    material.backFaceCulling = false;
    return material;
  };

  // 创建毛玻璃材质
  const createFrostedGlassMaterial = (scene: Scene, color: string): PBRMaterial => {
    const material = new PBRMaterial('glassMaterial', scene);
    material.albedoColor = hexToColor3(color);
    material.alpha = 0.8;
    material.metallic = 0;
    material.roughness = 0.3;
    material.subSurface.isRefractionEnabled = true;
    material.subSurface.refractionIntensity = 0.8;
    material.backFaceCulling = false;
    return material;
  };

  // 根据类型创建材质
  const createMaterial = (scene: Scene, color: string, textureType: TextureType) => {
    switch (textureType) {
      case 'leather':
        return createLeatherMaterial(scene, color);
      case 'paint':
        return createCarPaintMaterial(scene, color);
      case 'glass':
        return createFrostedGlassMaterial(scene, color);
      default:
        return createSolidMaterial(scene, color);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // 创建引擎
    engineRef.current = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    // 创建场景
    const scene = new Scene(engineRef.current);
    sceneRef.current = scene;

    // 设置场景背景色
    scene.clearColor = new Color4(0, 0, 0, 0);

    // 创建相机
    const camera = new ArcRotateCamera(
      'camera',
      0,
      Math.PI / 2,
      10,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    // 创建光源
    new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // 创建一个大球体作为背景
    sphereRef.current = MeshBuilder.CreateSphere(
      'sphere',
      { diameter: 20, segments: 32 },
      scene
    );
    sphereRef.current.position = Vector3.Zero();

    // 设置初始材质
    sphereRef.current.material = createMaterial(scene, color, texture);

    // 渲染循环
    engineRef.current.runRenderLoop(() => {
      scene.render();
    });

    // 处理窗口大小变化
    const handleResize = () => {
      engineRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engineRef.current?.dispose();
    };
  }, []);

  // 当颜色或材质改变时更新材质
  useEffect(() => {
    if (!sceneRef.current || !sphereRef.current) return;

    sphereRef.current.material = createMaterial(sceneRef.current, color, texture);
  }, [color, texture]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        display: 'block',
      }}
    />
  );
};

export default Background;
