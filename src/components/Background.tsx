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
  EasingFunction,
  CircleEase,
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
  const materialRef = useRef<StandardMaterial | null>(null);
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
      'diffuseColor',
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

    // 添加缓动函数
    const easingFunction = new CircleEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    colorAnimation.setEasingFunction(easingFunction);

    colorAnimation.setKeys(keyFrames);
    return colorAnimation;
  };

  // 创建纯色材质
  const createSolidMaterial = (scene: Scene, color: string): StandardMaterial => {
    const material = new StandardMaterial('solidMaterial', scene);
    material.diffuseColor = hexToColor3(color);
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    material.emissiveColor = new Color3(0, 0, 0);
    material.ambientColor = new Color3(0, 0, 0);
    material.roughness = 0.3;
    material.metallic = 0.3;
    return material;
  };

  // 创建金属材质
  const createMetallicMaterial = (scene: Scene, color: string): PBRMaterial => {
    const material = new PBRMaterial('metallicMaterial', scene);
    material.albedoColor = hexToColor3(color);
    material.metallic = 0.8;
    material.roughness = 0.2;
    material.environmentIntensity = 0.5;
    return material;
  };

  // 创建光泽材质
  const createGlossyMaterial = (scene: Scene, color: string): StandardMaterial => {
    const material = new StandardMaterial('glossyMaterial', scene);
    material.diffuseColor = hexToColor3(color);
    material.specularColor = new Color3(1, 1, 1);
    material.specularPower = 32;
    material.emissiveColor = new Color3(0, 0, 0);
    material.ambientColor = new Color3(0, 0, 0);
    return material;
  };

  // 创建材质
  const createMaterial = (scene: Scene, color: string, textureType: TextureType) => {
    switch (textureType) {
      case 'metallic':
        return createMetallicMaterial(scene, color);
      case 'glossy':
        return createGlossyMaterial(scene, color);
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
    materialRef.current = createSolidMaterial(scene, color);
    sphereRef.current.material = materialRef.current;

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
    if (!sceneRef.current || !materialRef.current || !sphereRef.current) return;

    const targetColor = hexToColor3(color);
    const animation = createColorAnimation(currentColorRef.current, targetColor);
    
    // 停止之前的动画（如果有）
    materialRef.current.animations = [];
    
    // 开始新的动画
    materialRef.current.animations.push(animation);
    sceneRef.current.beginAnimation(materialRef.current, 0, 30, false);
    
    // 更新当前颜色引用
    currentColorRef.current = targetColor;
  }, [color]);

  // 当纹理改变时更新材质
  useEffect(() => {
    if (!sceneRef.current || !sphereRef.current) return;
    const newMaterial = createMaterial(sceneRef.current, color, texture);
    materialRef.current = newMaterial;
    sphereRef.current.material = newMaterial;
  }, [texture]);

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
