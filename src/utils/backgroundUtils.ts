import {
  Scene,
  Color3,
  StandardMaterial,
  PBRMaterial,
  Animation,
  EasingFunction,
  CircleEase,
  NoiseProceduralTexture,
  Texture,
} from '@babylonjs/core';
import createLogger from './logger';

const logger = createLogger('backgroundUtils');

// 材质缓存
interface MaterialCache {
  [key: string]: StandardMaterial | PBRMaterial;
}

// 为每个场景维护一个单独的缓存
const sceneCache = new WeakMap<Scene, MaterialCache>();

// 获取场景的材质缓存
const getSceneMaterialCache = (scene: Scene): MaterialCache => {
  if (!sceneCache.has(scene)) {
    sceneCache.set(scene, {});
  }
  return sceneCache.get(scene)!;
};

// 生成材质缓存键
const getMaterialCacheKey = (type: string, color: string): string => {
  return `${type}_${color}`;
};

// 从缓存获取材质，如果不存在则创建
const getMaterialFromCache = (
  scene: Scene,
  type: string,
  color: string,
  createFn: () => StandardMaterial | PBRMaterial
): StandardMaterial | PBRMaterial => {
  const cache = getSceneMaterialCache(scene);
  const cacheKey = getMaterialCacheKey(type, color);
  
  if (cache[cacheKey]) {
    logger.debug('Using cached material:', { type, color });
    const material = cache[cacheKey];
    
    // 确保材质已准备好
    if (material instanceof StandardMaterial) {
      material.markAsDirty(StandardMaterial.TextureDirtyFlag);
    } else if (material instanceof PBRMaterial) {
      material.markAsDirty(PBRMaterial.TextureDirtyFlag);
    }
    
    return material;
  }
  
  logger.debug('Creating new material:', { type, color });
  const material = createFn();
  cache[cacheKey] = material;
  return material;
};

/**
 * 将十六进制颜色转换为 Babylon Color3
 * @param hex 十六进制颜色值
 * @returns Babylon Color3 对象
 */
export const hexToColor3 = (hex: string): Color3 => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new Color3(r, g, b);
};

/**
 * 创建颜色过渡动画
 * @param fromColor 起始颜色
 * @param toColor 目标颜色
 * @param property 要动画的属性名
 * @returns Babylon Animation 对象
 */
export const createColorAnimation = (fromColor: Color3, toColor: Color3, property: string): Animation => {
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

/**
 * 创建纯色材质
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns StandardMaterial 对象
 */
export const createSolidMaterial = (scene: Scene, color: string): StandardMaterial => {
  return getMaterialFromCache(scene, 'solid', color, () => {
    const material = new StandardMaterial('solidMaterial', scene);
    const colorValue = hexToColor3(color);
    material.diffuseColor = colorValue;
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    material.specularPower = 64;
    return material;
  });
};

/**
 * 创建金属材质
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createMetallicMaterial = (scene: Scene, color: string): PBRMaterial => {
  return getMaterialFromCache(scene, 'metallic', color, () => {
    const material = new PBRMaterial('metallicMaterial', scene);
    const colorValue = hexToColor3(color);
    material.albedoColor = colorValue;
    material.metallic = 0.8;
    material.roughness = 0.2;
    material.environmentIntensity = 0.5;
    return material;
  });
};

/**
 * 创建光泽材质（车漆）
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createGlossyMaterial = (scene: Scene, color: string): PBRMaterial => {
  return getMaterialFromCache(scene, 'glossy', color, () => {
    const material = new PBRMaterial('paintMaterial', scene);
    const colorValue = hexToColor3(color);
    
    // 基础颜色
    material.albedoColor = colorValue;
    
    // 创建噪声纹理作为斑点效果
    const noiseTexture = new NoiseProceduralTexture('noiseTexture', 256, scene);
    noiseTexture.octaves = 4;  // 噪声的细节层级
    noiseTexture.persistence = 0.8;  // 每层噪声的持续度
    noiseTexture.animationSpeedFactor = 0;  // 禁用动画
    noiseTexture.brightness = 0.5;  // 亮度调整
    
    // 使用噪声纹理作为金属度贴图
    material.metallicTexture = noiseTexture;
    
    // 金属度和粗糙度设置
    material.metallic = 0.9;  // 较高的金属度
    material.roughness = 0.2;  // 较低的粗糙度，使表面更光滑
    
    // 环境反射设置
    material.environmentIntensity = 1.0;  // 环境贴图强度
    material.clearCoat.isEnabled = true;  // 启用清漆层
    material.clearCoat.intensity = 1.0;   // 清漆强度
    material.clearCoat.roughness = 0.1;   // 清漆粗糙度
    material.clearCoat.indexOfRefraction = 1.5;  // 清漆层的折射率
    
    // 基础层折射率
    material.indexOfRefraction = 1.5;      // 基础涂层的折射率
    material.subSurface.isRefractionEnabled = true;  // 启用折射
    
    return material;
  });
};

/**
 * 创建皮革材质（小羊皮）
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createLeatherMaterial = (scene: Scene, color: string): PBRMaterial => {
  return getMaterialFromCache(scene, 'leather', color, () => {
    const material = new PBRMaterial('leatherMaterial', scene);
    const colorValue = hexToColor3(color);
    
    // 基础颜色
    material.albedoColor = colorValue;
    
    // 创建噪声纹理作为皮革纹理
    const noiseTexture = new NoiseProceduralTexture('leatherNoise', 512, scene);
    noiseTexture.octaves = 8;  // 更多的细节层级
    noiseTexture.persistence = 0.7;  // 较低的持续度，使纹理更自然
    noiseTexture.animationSpeedFactor = 0;  // 禁用动画
    noiseTexture.brightness = 0.7;  // 调整亮度
    
    // 第二层噪声纹理用于细微纹理
    const microNoiseTexture = new NoiseProceduralTexture('microNoise', 512, scene);
    microNoiseTexture.octaves = 4;
    microNoiseTexture.persistence = 0.5;
    microNoiseTexture.animationSpeedFactor = 0;
    microNoiseTexture.brightness = 0.8;
    
    // 使用噪声纹理作为凹凸贴图和粗糙度贴图
    material.bumpTexture = noiseTexture;
    material.roughnessTexture = microNoiseTexture;
    
    // 材质属性
    material.metallic = 0;  // 非金属
    material.roughness = 0.7;  // 较高的粗糙度
    material.bumpTexture.level = 0.3;  // 凹凸程度
    material.useParallax = true;  // 启用视差效果
    material.useParallaxOcclusion = true;  // 使用视差遮挡
    material.parallaxScaleBias = 0.1;  // 视差强度
    
    // 环境反射设置
    material.environmentIntensity = 0.3;  // 较低的环境反射
    material.specularIntensity = 0.3;  // 较低的镜面反射
    
    // 微表面设置
    material.microSurface = 0.8;  // 微表面光滑度
    
    return material;
  });
};

/**
 * 创建毛玻璃材质
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createGlassMaterial = (scene: Scene, color: string): PBRMaterial => {
  return getMaterialFromCache(scene, 'glass', color, () => {
    const material = new PBRMaterial('glassMaterial', scene);
    const colorValue = hexToColor3(color);
    
    // 基础颜色和透明度设置
    material.albedoColor = colorValue;
    material.alpha = 0.2;  // 透明度
    material.metallic = 0.1;
    
    // 玻璃效果
    material.roughness = 0.1;
    material.subSurface.isRefractionEnabled = true;
    material.subSurface.refractionIntensity = 1.0;
    material.indexOfRefraction = 1.5;
    
    // 环境反射设置
    material.environmentIntensity = 1.0;
    
    // 透明度设置
    material.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    material.backFaceCulling = false;
    material.alphaMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    material.useAlphaFromAlbedoTexture = false;
    material.forceAlphaTest = false;
    
    return material;
  });
};

// 计算对比色
export const getContrastColor = (hexcolor: string): string => {
  // 移除 # 号
  const hex = hexcolor.replace('#', '');
  
  // 转换为 RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 使用 YIQ 算法计算亮度
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // 亮度大于 128 时使用深色文字，否则使用浅色文字
  return yiq >= 128 ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
};
