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
  Animation,
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
  const currentColorRef = useRef<Color3>(new Color3(1, 1, 1));

  // 将十六进制颜色转换为 Babylon Color3
  const hexToColor3 = (hex: string): Color3 => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new Color3(r, g, b);
  };

  // 创建颜色过渡动画
  const createColorAnimation = (fromColor: Color3, toColor: Color3): Animation => {
    const colorAnimation = new Animation(
      'colorAnimation',
      'material.albedoColor',
      60, // 每秒帧数
      Animation.ANIMATIONTYPE_COLOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyFrames = [];
    keyFrames.push({
      frame: 0,
      value: fromColor
    });
    keyFrames.push({
      frame: 30, // 0.5秒的过渡时间
      value: toColor
    });

    colorAnimation.setKeys(keyFrames);
    return colorAnimation;
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

    // 设置场景背景色
    scene.clearColor = new Color4(0, 0, 0, 0);

    // 创建相机
    const camera = new ArcRotateCamera(
      'camera',
      debug ? -Math.PI / 2 : 0,
      debug ? Math.PI / 2.5 : Math.PI / 2,
      debug ? 25 : 10,
      Vector3.Zero(),
      scene
    );
    cameraRef.current = camera;
    camera.attachControl(canvasRef.current, true);
    
    // 根据模式设置相机限制
    if (debug) {
      camera.lowerRadiusLimit = 15;
      camera.upperRadiusLimit = 40;
      camera.lowerBetaLimit = 0.1;
      camera.upperBetaLimit = Math.PI - 0.1;
      camera.angularSensibilityX = 500;
      camera.angularSensibilityY = 500;
      camera.wheelPrecision = 50;
      camera.pinchPrecision = 50;
      camera.panningSensibility = 50;
    } else {
      camera.lowerRadiusLimit = 8;
      camera.upperRadiusLimit = 12;
      camera.lowerBetaLimit = Math.PI / 2;
      camera.upperBetaLimit = Math.PI / 2;
      camera.lowerAlphaLimit = 0;
      camera.upperAlphaLimit = 0;
    }

    // 创建主光源
    const mainLight = new HemisphericLight('mainLight', new Vector3(0, 1, 0), scene);
    mainLight.intensity = 0.7;
    mainLight.groundColor = new Color3(0.2, 0.2, 0.2);

    // 在 3D 模式下添加额外的光源
    if (debug) {
      const pointLight1 = new PointLight('pointLight1', new Vector3(10, 10, 10), scene);
      pointLight1.intensity = 0.3;

      const pointLight2 = new PointLight('pointLight2', new Vector3(-10, -10, -10), scene);
      pointLight2.intensity = 0.3;

      const gl = new GlowLayer('glow', scene, {
        mainTextureFixedSize: 512,
        blurKernelSize: 32
      });
      gl.intensity = 0.5;
    }

    // 创建球体
    sphereRef.current = MeshBuilder.CreateSphere(
      'sphere',
      { 
        diameter: debug ? 15 : 20,
        segments: debug ? 128 : 64 
      },
      scene
    );
    sphereRef.current.position = Vector3.Zero();

    // 设置初始材质
    const initialColor = hexToColor3(color);
    currentColorRef.current = initialColor;
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
  }, [debug]);

  // 当颜色改变时，创建并执行过渡动画
  useEffect(() => {
    if (!sceneRef.current || !sphereRef.current) return;

    const targetColor = hexToColor3(color);
    const animation = createColorAnimation(currentColorRef.current, targetColor);
    
    // 停止之前的动画（如果有）
    sphereRef.current.material.animations = [];
    
    // 开始新的动画
    sphereRef.current.material.animations.push(animation);
    sceneRef.current.beginAnimation(sphereRef.current.material, 0, 30, false);
    
    // 更新当前颜色引用
    currentColorRef.current = targetColor;
  }, [color]);

  // 当纹理改变时更新材质
  useEffect(() => {
    if (!sceneRef.current || !sphereRef.current) return;
    sphereRef.current.material = createMaterial(sceneRef.current, color, texture);
  }, [texture]);

  // 当调试模式改变时更新相机
  useEffect(() => {
    if (!cameraRef.current) return;
    
    const camera = cameraRef.current;
    
    if (debug) {
      // 3D 模式：动画过渡到新视角
      camera.setPosition(new Vector3(25 * Math.cos(-Math.PI / 2), 25 * Math.sin(Math.PI / 2.5), 25 * Math.sin(-Math.PI / 2)));
      camera.lowerRadiusLimit = 15;
      camera.upperRadiusLimit = 40;
      camera.lowerBetaLimit = 0.1;
      camera.upperBetaLimit = Math.PI - 0.1;
      camera.angularSensibilityX = 500;
      camera.angularSensibilityY = 500;
      camera.wheelPrecision = 50;
      camera.pinchPrecision = 50;
      camera.panningSensibility = 50;
    } else {
      // 2D 模式：动画过渡回原始视角
      camera.setPosition(new Vector3(0, 0, 10));
      camera.lowerRadiusLimit = 8;
      camera.upperRadiusLimit = 12;
      camera.lowerBetaLimit = Math.PI / 2;
      camera.upperBetaLimit = Math.PI / 2;
      camera.lowerAlphaLimit = 0;
      camera.upperAlphaLimit = 0;
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
