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
  CubeTexture,
} from '@babylonjs/core';
import { TextureType } from '../components/TextureTools';
import {
  createSolidMaterial,
  createMetallicMaterial,
  createGlossyMaterial,
  createGlassMaterial,
  createLeatherMaterial,
} from './backgroundUtils';
import createLogger from './logger';

const logger = createLogger('canvasBackground');

/**
 * 根据纹理类型创建材质
 */
export const createMaterialByType = (scene: Scene, color: string, type: TextureType) => {
  logger.info('Creating material:', { type, color });
  
  let material;
  switch (type) {
    case 'solid':
      logger.debug('Creating solid material');
      material = createSolidMaterial(scene, color);
      break;
    case 'leather':
      logger.debug('Creating leather material');
      material = createLeatherMaterial(scene, color);
      break;
    case 'paint':
      logger.debug('Creating paint material');
      material = createGlossyMaterial(scene, color);
      break;
    case 'glass':
      logger.debug('Creating glass material');
      material = createGlassMaterial(scene, color);
      break;
    default:
      logger.warn('Unknown texture type, falling back to solid material');
      material = createSolidMaterial(scene, color);
  }

  logger.info('Material created successfully');
  return material;
};

/**
 * 设置场景
 */
export const setupScene = (scene: Scene) => {
  scene.clearColor = new Color4(0, 0, 0, 0);
  scene.ambientColor = new Color3(0.3, 0.3, 0.3);
  
  // 创建HDR环境
  const envTexture = CubeTexture.CreateFromPrefilteredData(
    "https://assets.babylonjs.com/environments/environmentSpecular.env",
    scene
  );
  scene.environmentTexture = envTexture;
  scene.createDefaultSkybox(envTexture, true, 1000);
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
