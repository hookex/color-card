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
import {
  createColorAnimation,
  createSolidMaterial,
  createMetallicMaterial,
  createGlossyMaterial,
  createGlassMaterial,
} from '../utils/backgroundUtils';
import createLogger from '../utils/logger';

const logger = createLogger('background');

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

  // 根据纹理类型创建材质
  const createMaterialByType = (scene: Scene, color: string, type: TextureType) => {
    switch (type) {
      case 'solid':
        return createSolidMaterial(scene, color);
      case 'leather':
        return createMetallicMaterial(scene, color);
      case 'paint':
        return createGlossyMaterial(scene, color);
      case 'glass':
        return createGlassMaterial(scene, color);
      default:
        return createSolidMaterial(scene, color);
    }
  };

  // 更新材质
  const updateMaterial = () => {
    if (!sceneRef.current || !materialRef.current) return;

    const newMaterial = createMaterialByType(sceneRef.current, color, texture);
    const oldMaterial = materialRef.current;

    // 创建颜色过渡动画
    if (oldMaterial instanceof StandardMaterial && newMaterial instanceof StandardMaterial) {
      const animation = createColorAnimation(
        oldMaterial.diffuseColor,
        newMaterial.diffuseColor,
        'diffuseColor'
      );
      oldMaterial.animations = [animation];
      sceneRef.current.beginAnimation(oldMaterial, 0, 30);
    } else if (oldMaterial instanceof PBRMaterial && newMaterial instanceof PBRMaterial) {
      const animation = createColorAnimation(
        oldMaterial.albedoColor,
        newMaterial.albedoColor,
        'albedoColor'
      );
      oldMaterial.animations = [animation];
      sceneRef.current.beginAnimation(oldMaterial, 0, 30);
    } else {
      // 如果材质类型不同，直接替换
      if (sphereRef.current) {
        sphereRef.current.material = newMaterial;
        materialRef.current = newMaterial;
      }
    }
  };

  useEffect(() => {
    if (mode === 'div') {
      logger.info('Using div mode for background');
      return;
    }

    logger.info('Initializing 3D scene with:', { color, texture, debug });
    
    if (!canvasRef.current) {
      logger.error('Canvas element not found');
      return;
    }

    try {
      // Initialize engine and scene
      engineRef.current = new Engine(canvasRef.current, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true,
      });
      sceneRef.current = new Scene(engineRef.current);
      
      logger.info('Engine and scene created successfully');
      
      sceneRef.current.clearColor = new Color4(0, 0, 0, 0);

      const camera = new ArcRotateCamera(
        'camera',
        debug ? -Math.PI / 2 : 0,
        debug ? Math.PI / 2.5 : Math.PI / 2,
        debug ? 25 : 10,
        Vector3.Zero(),
        sceneRef.current
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

      const mainLight = new HemisphericLight('mainLight', new Vector3(0, 1, 0), sceneRef.current);
      mainLight.intensity = 0.7;
      mainLight.groundColor = new Color3(0.2, 0.2, 0.2);

      if (debug) {
        const pointLight1 = new PointLight('pointLight1', new Vector3(10, 10, 10), sceneRef.current);
        pointLight1.intensity = 0.3;

        const pointLight2 = new PointLight('pointLight2', new Vector3(-10, -10, -10), sceneRef.current);
        pointLight2.intensity = 0.3;

        const gl = new GlowLayer('glow', sceneRef.current, {
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
        sceneRef.current
      );
      sphereRef.current.position = Vector3.Zero();

      // 创建初始材质
      const newMaterial = createMaterialByType(sceneRef.current, color, texture);
      materialRef.current = newMaterial;
      sphereRef.current.material = newMaterial;

      engineRef.current.runRenderLoop(() => {
        sceneRef.current.render();
      });

      const handleResize = () => {
        engineRef.current?.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        sceneRef.current.dispose();
      };
    } catch (error) {
      logger.error('Error initializing scene:', error);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'div') return;
    
    if (sceneRef.current) {
      logger.info('Updating scene properties:', { color, texture, debug });
      updateMaterial();
    }
  }, [color, texture, debug, mode]);

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
