import {
  Scene,
  Color3,
  Color4,
  Vector3,
  ArcRotateCamera,
  HemisphericLight,
  PointLight,
  StandardMaterial,
  PBRMaterial,
} from '@babylonjs/core';
import { TextureType } from '../components/TextureTools';
import {
  createSolidMaterial,
  createMetallicMaterial,
  createGlossyMaterial,
  createGlassMaterial,
} from './backgroundUtils';

/**
 * 根据纹理类型创建材质
 */
export const createMaterialByType = (scene: Scene, color: string, type: TextureType) => {
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

/**
 * 设置场景
 */
export const setupScene = (scene: Scene) => {
  scene.clearColor = new Color4(0, 0, 0, 0);
  scene.ambientColor = new Color3(0.3, 0.3, 0.3);
};

/**
 * 设置相机
 */
export const setupCamera = (scene: Scene) => {
  const camera = new ArcRotateCamera(
    'camera',
    0,
    Math.PI / 2,
    5,
    Vector3.Zero(),
    scene
  );
  camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 10;
  camera.wheelDeltaPercentage = 0.01;
  return camera;
};

/**
 * 设置灯光
 */
export const setupLights = (scene: Scene) => {
  // 半球光
  const hemisphericLight = new HemisphericLight(
    'hemisphericLight',
    new Vector3(0, 1, 0),
    scene
  );
  hemisphericLight.intensity = 0.7;

  // 点光源
  const pointLight = new PointLight(
    'pointLight',
    new Vector3(0, 5, -5),
    scene
  );
  pointLight.intensity = 0.5;
};
