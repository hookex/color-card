import {
  Scene,
  Color3,
  StandardMaterial,
  PBRMaterial,
  Animation,
  EasingFunction,
  CircleEase,
  NoiseProceduralTexture,
  DynamicTexture,
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
const getMaterialFromCache = <T extends StandardMaterial | PBRMaterial>(
  scene: Scene,
  type: string,
  color: string,
  createFn: () => T
): T => {
  const cache = getSceneMaterialCache(scene);
  const cacheKey = getMaterialCacheKey(type, color);

  if (cacheKey in cache) {
    logger.debug('Using cached material:', { type, color });
    const material = cache[cacheKey] as T;
    
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
    
    // 使用噪声纹理作为凹凸贴图和金属度贴图
    material.bumpTexture = noiseTexture;
    material.metallicTexture = microNoiseTexture;
    
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
 * 这是一个基于 PBR（基于物理的渲染）的材质，用于创建磨砂玻璃效果
 * PBR 材质可以模拟现实世界中的材质外观，包括反射、折射、散射等效果
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createGlassMaterial = (scene: Scene, color: string): PBRMaterial => {
  return getMaterialFromCache(scene, 'glass', color, () => {
    const material = new PBRMaterial('glassMaterial', scene);
    
    // ===== 基础材质属性 =====
    
    // albedoColor: 材质的基础颜色，这是材质在完全漫反射下的颜色
    // 使用传入的颜色作为基础色
    material.albedoColor = Color3.FromHexString(color);
    
    // alpha: 材质的整体透明度
    // 0 = 完全透明，1 = 完全不透明
    // 设置为 0.6 来获得半透明效果
    material.alpha = 0.6;
    
    // metallic: 材质的金属度
    // 0 = 非金属（绝缘体），1 = 纯金属
    // 设置较低的值(0.1)以模拟玻璃的非金属特性
    material.metallic = 0.1;
    
    // ===== 玻璃特定属性 =====
    
    // roughness: 材质的粗糙度
    // 0 = 完全光滑（镜面反射），1 = 完全粗糙（漫反射）
    // 设置为 0.3 来获得轻微的磨砂效果
    material.roughness = 0.3;
    
    // 折射相关设置
    material.subSurface.isRefractionEnabled = true;  // 启用折射效果
    
    // refractionIntensity: 折射强度
    // 控制透过材质看到的物体的扭曲程度
    // 设置适中的值(0.4)以获得自然的折射效果
    material.subSurface.refractionIntensity = 0.4;
    
    // indexOfRefraction: 折射率
    // 控制光线通过材质时的弯曲程度
    // 真实玻璃约为 1.5，这里设置为 1.2 以获得更柔和的效果
    material.indexOfRefraction = 1.2;
    
    // ===== 环境和光照属性 =====
    
    // environmentIntensity: 环境反射强度
    // 控制材质对环境光的反射程度
    // 设置较低的值(0.3)以减少反射，增加磨砂感
    material.environmentIntensity = 0.3;
    
    // ===== 透明度设置 =====
    
    // transparencyMode: 透明度模式
    // PBRMATERIAL_ALPHABLEND = 启用 alpha 混合
    material.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    
    // backFaceCulling: 背面剔除
    // false = 双面渲染，使材质的两面都可见
    material.backFaceCulling = false;
    
    // useAlphaFromAlbedoTexture: 是否使用反照率贴图的 alpha 通道
    // 启用以便使用噪声纹理控制透明度
    material.useAlphaFromAlbedoTexture = true;
    
    // forceAlphaTest: 强制 alpha 测试
    // false = 使用正常的 alpha 混合
    material.forceAlphaTest = false;
    
    // ===== 噪声纹理设置 =====
    
    // 创建程序化噪声纹理
    // 1024 = 纹理分辨率，更高的值会产生更细腻的效果
    const noiseTexture = new NoiseProceduralTexture('noiseTexture', 1024, scene);
    
    // octaves: 噪声的叠加次数
    // 更高的值会产生更复杂的噪声图案
    noiseTexture.octaves = 128;
    
    // persistence: 每个八度的强度衰减
    // 控制不同层级噪声的混合程度
    noiseTexture.persistence = 2;
    
    // animationSpeedFactor: 动画速度
    // 0 = 静态噪声
    noiseTexture.animationSpeedFactor = 0;
    
    // brightness: 噪声纹理的亮度
    // 影响整体的可见度
    noiseTexture.brightness = 0.6;
    
    // ===== 纹理应用 =====
    
    // bumpTexture: 凹凸贴图
    // 用于创建表面细节的视觉效果
    material.bumpTexture = noiseTexture;
    material.bumpTexture.level = 6;  // 控制凹凸效果的强度
    
    // opacityTexture: 不透明度贴图
    // 用于创建不均匀的透明效果
    material.opacityTexture = noiseTexture;
    
    // microSurfaceTexture: 微表面贴图
    // 用于控制局部的粗糙度变化，增加更真实的磨砂效果
    material.microSurfaceTexture = noiseTexture;
    
    return material;
  });
};

/**
 * 计算对比色
 * @param hexcolor 十六进制颜色值
 * @returns 对比色
 */
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

/**
 * 计算颜色的亮度值
 * @param hex 十六进制颜色值
 * @returns 0-1之间的亮度值
 */
export const getLuminance = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  // 使用相对亮度公式
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * 获取毛玻璃效果的背景透明度
 * @param hex 十六进制颜色值
 * @returns 合适的背景透明度
 */
export const getGlassOpacity = (hex: string): number => {
  const luminance = getLuminance(hex);
  // 亮色背景使用较高透明度，暗色背景使用较低透明度
  return luminance > 0.5 ? 0.2 : 0.1;
};

/**
 * 创建线性渐变材质
 * @param scene Babylon Scene 对象
 * @param startColor 起始颜色（十六进制）
 * @param endColor 结束颜色（十六进制）
 * @returns StandardMaterial 对象
 */
export const createLinearGradientMaterial = (
  scene: Scene,
  startColor: string,
  endColor: string
): StandardMaterial => {
  return getMaterialFromCache(scene, 'linear_gradient', `${startColor}_${endColor}`, () => {
    const material = new StandardMaterial('linearGradient', scene);
    
    // 创建画布来生成渐变纹理
    const canvas = document.createElement('canvas');
    canvas.width = 1;  // 宽度为1像素以确保完全线性
    canvas.height = 256;  // 高度决定渐变的精度
    const ctx = canvas.getContext('2d')!;
    
    // 创建线性渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    
    // 填充渐变
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 创建纹理
    const texture = new DynamicTexture('gradientTexture', { width: canvas.width, height: canvas.height }, scene, true);
    
    // 从画布更新纹理
    const textureContext = texture.getContext();
    textureContext.drawImage(canvas, 0, 0);
    texture.update();
    
    // 设置材质属性
    material.diffuseTexture = texture;
    material.specularColor = new Color3(0, 0, 0); // 去除反光
    material.emissiveColor = new Color3(0, 0, 0);
    material.ambientColor = new Color3(1, 1, 1);
    
    return material;
  });
};
