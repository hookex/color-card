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
} from '@babylonjs/core';

interface Props {
  color: string;
  onSceneReady?: (scene: Scene) => void;
}

const Background: React.FC<Props> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  // 将十六进制颜色转换为 Babylon Color3
  const hexToColor3 = (hex: string): Color3 => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new Color3(r, g, b);
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
    const sphere = MeshBuilder.CreateSphere(
      'sphere',
      { diameter: 20, segments: 32 },
      scene
    );
    sphere.position = Vector3.Zero();

    // 创建材质
    const material = new StandardMaterial('sphereMaterial', scene);
    material.backFaceCulling = false;
    material.diffuseColor = hexToColor3(color);
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    material.emissiveColor = hexToColor3(color).scale(0.3);
    sphere.material = material;

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

  // 当颜色改变时更新材质
  useEffect(() => {
    if (!sceneRef.current) return;

    const sphere = sceneRef.current.getMeshByName('sphere');
    if (sphere) {
      const material = sphere.material as StandardMaterial;
      if (material) {
        material.diffuseColor = hexToColor3(color);
        material.emissiveColor = hexToColor3(color).scale(0.3);
      }
    }
  }, [color]);

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
