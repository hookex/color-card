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
  mode?: 'canvas' | 'div';
}

const Background: React.FC<Props> = ({ color, texture, debug = false, mode = 'canvas' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const sphereRef = useRef<any>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const materialRef = useRef<StandardMaterial | PBRMaterial | null>(null);

  // 将十六进制颜色转换为 Babylon Color3
  const hexToColor3 = (hex: string): Color3 => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new Color3(r, g, b);
  };

  // 创建颜色过渡动画
  const createColorAnimation = (fromColor: Color3, toColor: Color3, property: string): Animation => {
    const colorAnimation = new Animation(
      'colorAnimation',
      property,
      60,
      Animation.ANIMATIONTYPE_COLOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyFrames = [];
    keyFrames.push({
      frame: 0,
      value: fromColor
    });
    keyFrames.push({
      frame: 30,
      value: toColor
    });

    const easingFunction = new CircleEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    colorAnimation.setEasingFunction(easingFunction);

    colorAnimation.setKeys(keyFrames);
    return colorAnimation;
  };

  // 创建纯色材质
  const createSolidMaterial = (scene: Scene, color: string): StandardMaterial => {
    const material = new StandardMaterial('solidMaterial', scene);
    const colorValue = hexToColor3(color);
    material.diffuseColor = colorValue;
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    material.emissiveColor = new Color3(0, 0, 0);
    material.ambientColor = new Color3(0, 0, 0);
    material.roughness = 0.3;
    return material;
  };

  // 创建金属材质
  const createMetallicMaterial = (scene: Scene, color: string): PBRMaterial => {
    const material = new PBRMaterial('metallicMaterial', scene);
    const colorValue = hexToColor3(color);
    material.albedoColor = colorValue;
    material.metallic = 0.8;
    material.roughness = 0.2;
    material.environmentIntensity = 0.5;
    return material;
  };

  // 创建光泽材质
  const createGlossyMaterial = (scene: Scene, color: string): StandardMaterial => {
    const material = new StandardMaterial('glossyMaterial', scene);
    const colorValue = hexToColor3(color);
    material.diffuseColor = colorValue;
    material.specularColor = new Color3(1, 1, 1);
    material.specularPower = 32;
    material.emissiveColor = new Color3(0, 0, 0);
    material.ambientColor = new Color3(0, 0, 0);
    return material;
  };

  // 创建材质
  const createMaterial = (scene: Scene, color: string, textureType: TextureType): StandardMaterial | PBRMaterial => {
    switch (textureType) {
      case 'leather':
        return createMetallicMaterial(scene, color);
      case 'paint':
        return createGlossyMaterial(scene, color);
      case 'glass':
        return createGlossyMaterial(scene, color);
      case 'solid':
      default:
        return createSolidMaterial(scene, color);
    }
  };

  // 更新材质颜色
  const updateMaterialColor = (material: StandardMaterial | PBRMaterial, color: string) => {
    const colorValue = hexToColor3(color);
    if (material instanceof StandardMaterial) {
      material.diffuseColor = colorValue;
    } else if (material instanceof PBRMaterial) {
      material.albedoColor = colorValue;
    }
  };

  useEffect(() => {
    if (mode === 'canvas') {
      initScene();
    }
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, [mode]);

  const initScene = () => {
    if (!canvasRef.current) return;

    engineRef.current = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    const scene = new Scene(engineRef.current);
    sceneRef.current = scene;

    scene.clearColor = new Color4(0, 0, 0, 0);

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

    const mainLight = new HemisphericLight('mainLight', new Vector3(0, 1, 0), scene);
    mainLight.intensity = 0.7;
    mainLight.groundColor = new Color3(0.2, 0.2, 0.2);

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

    sphereRef.current = MeshBuilder.CreateSphere(
      'sphere',
      { 
        diameter: debug ? 15 : 20,
        segments: debug ? 128 : 64 
      },
      scene
    );
    sphereRef.current.position = Vector3.Zero();

    // 创建初始材质
    const newMaterial = createMaterial(scene, color, texture);
    materialRef.current = newMaterial;
    sphereRef.current.material = newMaterial;

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
    };
  };

  // 当颜色改变时，创建并执行过渡动画
  useEffect(() => {
    if (!sceneRef.current || !materialRef.current || !sphereRef.current) return;

    const targetColor = hexToColor3(color);
    const currentColor = materialRef.current instanceof StandardMaterial
      ? materialRef.current.diffuseColor
      : materialRef.current.albedoColor;

    const property = materialRef.current instanceof StandardMaterial
      ? 'diffuseColor'
      : 'albedoColor';

    const animation = createColorAnimation(currentColor, targetColor, property);
    
    materialRef.current.animations = [];
    materialRef.current.animations.push(animation);
    sceneRef.current.beginAnimation(materialRef.current, 0, 30, false);
  }, [color]);

  // 当纹理改变时更新材质
  useEffect(() => {
    if (!sceneRef.current || !sphereRef.current) return;
    
    const newMaterial = createMaterial(sceneRef.current, color, texture);
    if (materialRef.current) {
      materialRef.current.animations = [];
    }
    materialRef.current = newMaterial;
    sphereRef.current.material = newMaterial;
  }, [texture]);

  return (
    <>
      {mode === 'canvas' ? (
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            touchAction: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: color,
            transition: 'background-color 0.3s ease',
            zIndex: -1,
          }}
        />
      )}
    </>
  );
};

export default Background;
