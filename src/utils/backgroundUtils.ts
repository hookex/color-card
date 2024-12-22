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
 * 创建光泽材质
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns StandardMaterial 对象
 */
export const createGlossyMaterial = (scene: Scene, color: string): StandardMaterial => {
  const material = new StandardMaterial('glossyMaterial', scene);
  const colorValue = hexToColor3(color);
  material.diffuseColor = colorValue;
  material.specularColor = new Color3(1, 1, 1);
  material.specularPower = 32;
  material.roughness = 0;
  return material;
};

/**
 * 创建玻璃材质
 * @param scene Babylon Scene 对象
 * @param color 十六进制颜色值
 * @returns PBRMaterial 对象
 */
export const createGlassMaterial = (scene: Scene, color: string): PBRMaterial => {
  const material = new PBRMaterial('glassMaterial', scene);
  const colorValue = hexToColor3(color);
  material.albedoColor = colorValue;
  material.alpha = 0.5;
  material.metallic = 0.0;
  material.roughness = 0.1;
  material.environmentIntensity = 0.8;
  material.indexOfRefraction = 1.5;
  return material;
};
