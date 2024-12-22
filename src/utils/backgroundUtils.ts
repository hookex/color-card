import {
  Scene,
  Color3,
  StandardMaterial,
  PBRMaterial,
  Animation,
  EasingFunction,
  CircleEase,
} from '@babylonjs/core';

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
  const material = new StandardMaterial('solidMaterial', scene);
  const colorValue = hexToColor3(color);
  material.diffuseColor = colorValue;
  material.specularColor = new Color3(0.2, 0.2, 0.2);
  material.emissiveColor = new Color3(0, 0, 0);
  material.ambientColor = new Color3(0, 0, 0);
  material.roughness = 0.3;
  return material;
};

/**
 * 创建金属材质
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createMetallicMaterial = (scene: Scene, color: string): PBRMaterial => {
  const material = new PBRMaterial('metallicMaterial', scene);
  const colorValue = hexToColor3(color);
  material.albedoColor = colorValue;
  material.metallic = 0.8;
  material.roughness = 0.2;
  material.environmentIntensity = 0.5;
  return material;
};

/**
 * 创建光泽材质（车漆）
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createGlossyMaterial = (scene: Scene, color: string): PBRMaterial => {
  const material = new PBRMaterial('paintMaterial', scene);
  const colorValue = hexToColor3(color);
  
  // 基础颜色
  material.albedoColor = colorValue;
  
  // 金属度和粗糙度设置
  material.metallic = 0.8;  // 较高的金属度
  material.roughness = 0.15;  // 较低的粗糙度，使表面更光滑
  
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
};

/**
 * 创建毛玻璃材质
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createGlassMaterial = (scene: Scene, color: string): PBRMaterial => {
  const material = new PBRMaterial('glassMaterial', scene);
  const colorValue = hexToColor3(color);
  
  // 基础颜色和透明度
  material.albedoColor = colorValue;
  material.alpha = 0.6;  // 透明度
  material.metallic = 0.0;
  
  // 毛玻璃效果
  material.roughness = 0.4;  // 较高的粗糙度产生磨砂效果
  material.subSurface.isRefractionEnabled = true;  // 启用折射
  material.subSurface.refractionIntensity = 0.8;  // 折射强度
  material.indexOfRefraction = 1.5;  // 玻璃的折射率
  
  // 环境反射设置
  material.environmentIntensity = 0.7;  // 环境反射强度
  
  // 半透明设置
  material.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  material.backFaceCulling = false;  // 禁用背面剔除，使两面都可见
  
  return material;
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
