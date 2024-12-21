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
} from '@babylonjs/core';
import { TextureType } from './TextureTools';

interface Props {
  color: string;
  texture: TextureType;
  debug?: boolean;
}

const Background: React.FC<Props> = ({ color, texture, debug = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const sphereRef = useRef<any>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);

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
    material.emissiveColor = hexToColor3(color).scale(0.2);
    material.backFaceCulling = false;
    return material;
  };

  // 创建皮革材质
  const createLeatherMaterial = (scene: Scene, color: string): PBRMaterial => {
    const material = new PBRMaterial('leatherMaterial', scene);
    material.albedoColor = hexToColor3(color);
    material.metallic = 0;
    material.roughness = 0.7;
    material.microSurface = 0.8;
    material.useRoughnessFromMetallicTextureAlpha = false;
    material.useMetallnessFromMetallicTextureBlue = false;
    material.useRoughnessFromMetallicTextureGreen = false;
    material.emissiveColor = hexToColor3(color).scale(0.1);
    material.ambientColor = hexToColor3(color).scale(0.5);
    material.backFaceCulling = false;
    return material;
  };

  // 创建车漆材质
  const createCarPaintMaterial = (scene: Scene, color: string): PBRMaterial => {
    const material = new PBRMaterial('carPaintMaterial', scene);
    material.albedoColor = hexToColor3(color);
    material.metallic = 0.8;
    material.roughness = 0.15;
    material.microSurface = 0.95;
    material.clearCoat.isEnabled = true;
    material.clearCoat.intensity = 0.8;
    material.clearCoat.roughness = 0.15;
    material.emissiveColor = hexToColor3(color).scale(0.2);
    material.ambientColor = hexToColor3(color).scale(0.5);
    material.backFaceCulling = false;
    return material;
  };

  // 创建毛玻璃材质
  const createFrostedGlassMaterial = (scene: Scene, color: string): PBRMaterial => {
    const material = new PBRMaterial('glassMaterial', scene);
    material.albedoColor = hexToColor3(color);
    material.alpha = 0.92;
    material.metallic = 0.2;
    material.roughness = 0.3;
    material.microSurface = 0.8;
    material.emissiveColor = hexToColor3(color).scale(0.1);
    material.ambientColor = hexToColor3(color).scale(0.5);
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

    engineRef.current = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    const scene = new Scene(engineRef.current);
    sceneRef.current = scene;

    scene.clearColor = new Color4(0, 0, 0, 0);

    // 创建相机
    const camera = new ArcRotateCamera(
      'camera',
      debug ? Math.PI / 4 : 0,
      debug ? Math.PI / 3 : Math.PI / 2,
      debug ? 30 : 10,
      Vector3.Zero(),
      scene
    );
    cameraRef.current = camera;
    camera.attachControl(canvasRef.current, true);
    
    // 根据模式设置相机限制
    if (debug) {
      camera.lowerRadiusLimit = 15;
      camera.upperRadiusLimit = 45;
      camera.lowerBetaLimit = 0.1;
      camera.upperBetaLimit = Math.PI - 0.1;
    } else {
      camera.lowerRadiusLimit = 8;
      camera.upperRadiusLimit = 12;
      camera.lowerBetaLimit = Math.PI / 2;
      camera.upperBetaLimit = Math.PI / 2;
    }
    
    camera.wheelDeltaPercentage = 0.01;

    const mainLight = new HemisphericLight('mainLight', new Vector3(0, 1, 0), scene);
    mainLight.intensity = 0.8;
    mainLight.groundColor = new Color3(0.2, 0.2, 0.2);

    sphereRef.current = MeshBuilder.CreateSphere(
      'sphere',
      { diameter: 20, segments: 64 },
      scene
    );
    sphereRef.current.position = Vector3.Zero();
    sphereRef.current.material = createMaterial(scene, color, texture);

    engineRef.current.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engineRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engineRef.current?.dispose();
    };
  }, [debug]);

  // 当颜色或材质改变时更新材质
  useEffect(() => {
    if (!sceneRef.current || !sphereRef.current) return;
    sphereRef.current.material = createMaterial(sceneRef.current, color, texture);
  }, [color, texture]);

  // 当调试模式改变时更新相机
  useEffect(() => {
    if (!cameraRef.current) return;
    
    const camera = cameraRef.current;
    
    if (debug) {
      camera.radius = 30;
      camera.alpha = Math.PI / 4;
      camera.beta = Math.PI / 3;
      camera.lowerRadiusLimit = 15;
      camera.upperRadiusLimit = 45;
      camera.lowerBetaLimit = 0.1;
      camera.upperBetaLimit = Math.PI - 0.1;
    } else {
      camera.radius = 10;
      camera.alpha = 0;
      camera.beta = Math.PI / 2;
      camera.lowerRadiusLimit = 8;
      camera.upperRadiusLimit = 12;
      camera.lowerBetaLimit = Math.PI / 2;
      camera.upperBetaLimit = Math.PI / 2;
    }
  }, [debug]);

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
