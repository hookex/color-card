/**
 * 背景工具函数测试
 * 测试颜色处理和背景相关的工具函数
 */

import { describe, it, expect } from 'vitest';
import { getContrastColor, getGlassOpacity } from '../backgroundUtils';

describe('backgroundUtils', () => {
  describe('getContrastColor', () => {
    it('should return white for dark colors', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff');
      expect(getContrastColor('#333333')).toBe('#ffffff');
      expect(getContrastColor('#ff0000')).toBe('#ffffff'); // 红色
    });

    it('should return black for light colors', () => {
      expect(getContrastColor('#ffffff')).toBe('#000000');
      expect(getContrastColor('#ffff00')).toBe('#000000'); // 黄色
      expect(getContrastColor('#00ff00')).toBe('#000000'); // 绿色
    });

    it('should handle colors without # prefix', () => {
      expect(getContrastColor('000000')).toBe('#ffffff');
      expect(getContrastColor('ffffff')).toBe('#000000');
    });

    it('should handle invalid color inputs gracefully', () => {
      expect(getContrastColor('')).toBe('#000000');
      expect(getContrastColor('invalid')).toBe('#000000');
      expect(getContrastColor('#gggggg')).toBe('#000000');
    });

    it('should handle short hex colors', () => {
      expect(getContrastColor('#000')).toBe('#ffffff');
      expect(getContrastColor('#fff')).toBe('#000000');
    });
  });

  describe('getGlassOpacity', () => {
    it('should return default opacity for light colors', () => {
      const opacity = getGlassOpacity('#ffffff');
      expect(opacity).toBeGreaterThan(0);
      expect(opacity).toBeLessThanOrEqual(1);
    });

    it('should return appropriate opacity for dark colors', () => {
      const lightOpacity = getGlassOpacity('#ffffff');
      const darkOpacity = getGlassOpacity('#000000');
      
      // 深色应该有不同的不透明度
      expect(lightOpacity).not.toBe(darkOpacity);
    });

    it('should handle invalid inputs', () => {
      expect(() => getGlassOpacity('')).not.toThrow();
      expect(() => getGlassOpacity('invalid')).not.toThrow();
    });
  });
});