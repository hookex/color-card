/**
 * 动画服务测试
 * 测试动画服务的核心功能
 */

import { describe, it, expect } from 'vitest';
import { AnimationService, ANIMATION_CONFIGS, AnimationUtils } from '../animation/animationService';

describe('AnimationService', () => {
  describe('ANIMATION_CONFIGS', () => {
    it('should have all required animation configurations', () => {
      expect(ANIMATION_CONFIGS.quick).toBeDefined();
      expect(ANIMATION_CONFIGS.standard).toBeDefined();
      expect(ANIMATION_CONFIGS.smooth).toBeDefined();
      expect(ANIMATION_CONFIGS.elastic).toBeDefined();
      expect(ANIMATION_CONFIGS.slow).toBeDefined();
    });

    it('should have valid spring configuration values', () => {
      Object.values(ANIMATION_CONFIGS).forEach(config => {
        expect(config.tension).toBeGreaterThan(0);
        expect(config.friction).toBeGreaterThan(0);
        expect(config.mass).toBeGreaterThan(0);
        expect(typeof config.clamp).toBe('boolean');
      });
    });
  });

  describe('getSlideInTransform', () => {
    it('should return correct transform for each direction', () => {
      expect(AnimationService.getSlideInTransform('left')).toBe('translateX(100%)');
      expect(AnimationService.getSlideInTransform('right')).toBe('translateX(-100%)');
      expect(AnimationService.getSlideInTransform('up')).toBe('translateY(100%)');
      expect(AnimationService.getSlideInTransform('down')).toBe('translateY(-100%)');
    });

    it('should handle invalid direction with default', () => {
      // @ts-ignore - testing invalid input
      expect(AnimationService.getSlideInTransform('invalid')).toBe('translateX(100%)');
    });
  });

  describe('getSlideOutTransform', () => {
    it('should return correct transform for each direction', () => {
      expect(AnimationService.getSlideOutTransform('left')).toBe('translateX(-100%)');
      expect(AnimationService.getSlideOutTransform('right')).toBe('translateX(100%)');
      expect(AnimationService.getSlideOutTransform('up')).toBe('translateY(-100%)');
      expect(AnimationService.getSlideOutTransform('down')).toBe('translateY(100%)');
    });
  });

  describe('createPageTransitionState', () => {
    it('should create correct slide out state', () => {
      const { state, config } = AnimationService.createPageTransitionState('slideOut', 'left');
      
      expect(state.opacity).toBe(0);
      expect(state.transform).toBe('translateX(-100%)');
      expect(config).toBeDefined();
    });

    it('should create correct slide in state', () => {
      const { state, config } = AnimationService.createPageTransitionState('slideIn', 'left');
      
      expect(state.opacity).toBe(1);
      expect(state.transform).toBe('translateX(0%) translateY(0%)');
      expect(config).toBeDefined();
    });

    it('should create correct idle state', () => {
      const { state, config } = AnimationService.createPageTransitionState('idle');
      
      expect(state.opacity).toBe(1);
      expect(state.transform).toBe('translateX(0%) translateY(0%)');
      expect(config).toBeDefined();
    });
  });

  describe('createScaleAnimationState', () => {
    it('should create correct scale states', () => {
      const scaleDown = AnimationService.createScaleAnimationState('scaleDown');
      expect(scaleDown.state.scale).toBe(0.95);
      
      const scaleUp = AnimationService.createScaleAnimationState('scaleUp');
      expect(scaleUp.state.scale).toBe(1.05);
      
      const normal = AnimationService.createScaleAnimationState('normal');
      expect(normal.state.scale).toBe(1);
    });
  });

  describe('getDirectionFromIndexChange', () => {
    it('should return correct direction based on index change', () => {
      expect(AnimationService.getDirectionFromIndexChange(0, 1)).toBe('left');
      expect(AnimationService.getDirectionFromIndexChange(1, 0)).toBe('right');
      expect(AnimationService.getDirectionFromIndexChange(2, 5)).toBe('left');
      expect(AnimationService.getDirectionFromIndexChange(5, 2)).toBe('right');
    });
  });

  describe('createCombinedAnimationState', () => {
    it('should combine multiple animation effects', () => {
      const { state } = AnimationService.createCombinedAnimationState({
        opacity: 0.5,
        scale: 1.2,
        translateX: 50,
        translateY: -25,
        rotate: 45
      });

      expect(state.opacity).toBe(0.5);
      expect(state.scale).toBe(1.2);
      expect(state.transform).toContain('translateX(50%)');
      expect(state.transform).toContain('translateY(-25%)');
      expect(state.transform).toContain('scale(1.2)');
      expect(state.transform).toContain('rotate(45deg)');
    });

    it('should handle empty effects', () => {
      const { state } = AnimationService.createCombinedAnimationState({});
      
      expect(state.opacity).toBe(1);
      expect(state.transform).toBe('none');
    });
  });
});

describe('AnimationUtils', () => {
  describe('delay', () => {
    it('should create a promise that resolves after specified time', async () => {
      const start = Date.now();
      await AnimationUtils.delay(100);
      const elapsed = Date.now() - start;
      
      // Allow for some timing variation
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('createSequence', () => {
    it('should execute animations in sequence', async () => {
      const results: number[] = [];
      
      const animations = [
        async () => { results.push(1); await AnimationUtils.delay(10); },
        async () => { results.push(2); await AnimationUtils.delay(10); },
        async () => { results.push(3); await AnimationUtils.delay(10); }
      ];

      const sequence = AnimationUtils.createSequence(animations);
      await sequence();

      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('createParallel', () => {
    it('should execute animations in parallel', async () => {
      const results: number[] = [];
      
      const animations = [
        async () => { await AnimationUtils.delay(20); results.push(1); },
        async () => { await AnimationUtils.delay(10); results.push(2); },
        async () => { await AnimationUtils.delay(30); results.push(3); }
      ];

      const parallel = AnimationUtils.createParallel(animations);
      await parallel();

      // In parallel execution, shorter delays complete first
      expect(results).toEqual([2, 1, 3]);
    });
  });
});