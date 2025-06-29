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
  Engine,
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
import environmentSpecular from '/assets/environments/environmentSpecular.env?url';

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
    case 'frosted':  // 毛玻璃效果也使用玻璃材质
      logger.debug('Creating glass material');
      material = createGlassMaterial(scene, color);
      break;
    case 'linear':  // 线性效果：纯色材质，无纹理
      logger.debug('Creating linear solid material');
      material = createSolidMaterial(scene, color);
      break;
    case 'glow':    // 发光效果使用标准材质
      logger.debug('Creating glow material');
      material = createSolidMaterial(scene, color);
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
  // 设置透明背景
  scene.clearColor = new Color4(0, 0, 0, 0);
  scene.ambientColor = new Color3(0.8, 0.8, 0.8);  // 增加环境光亮度
  
  // 启用透明度排序
  scene.getEngine().setAlphaMode(Engine.ALPHA_COMBINE);
  
  // 创建HDR环境
  const envTexture = CubeTexture.CreateFromPrefilteredData(
    environmentSpecular,
    scene
  );
  scene.environmentTexture = envTexture;
  // 移除天空盒以避免黑色背景
  // scene.createDefaultSkybox(envTexture, true, 1000);
};

/**
 * 设置相机
 */
export const setupCamera = (scene: Scene) => {
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,  // alpha - 水平旋转角度
    Math.PI / 2,  // beta - 垂直旋转角度
    3,            // radius - 距离
    Vector3.Zero(),
    scene
  );
  camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 10;
  camera.wheelDeltaPercentage = 0.01;
  
  // 设置相机初始位置
  camera.setPosition(new Vector3(0, 0, -3));
  camera.setTarget(Vector3.Zero());
  
  return camera;
};

/**
 * 设置灯光
 */
export const setupLights = (scene: Scene) => {
  // 主光源
  const mainLight = new HemisphericLight(
    'mainLight',
    new Vector3(0, 1, 0),
    scene
  );
  mainLight.intensity = 1.2;  // 增加主光源强度
  mainLight.groundColor = new Color3(0.6, 0.6, 0.6);  // 增加地面反射光

  // 补光
  const pointLight = new PointLight(
    'pointLight',
    new Vector3(0, 0, -5),
    scene
  );
  pointLight.intensity = 0.8;  // 增加补光强度
  
  // 添加额外的侧光
  const sideLight = new PointLight(
    'sideLight',
    new Vector3(3, 2, 0),
    scene
  );
  sideLight.intensity = 0.6;
  sideLight.diffuse = new Color3(1, 1, 1);
};
