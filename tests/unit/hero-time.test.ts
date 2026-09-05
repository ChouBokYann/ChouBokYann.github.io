import { describe, expect, it } from 'vitest';
import { getHeroTimeScene } from '../../src/components/hero/time';

describe('getHeroTimeScene', () => {
  it('places the sun near the eastern horizon at local sunrise', () => {
    expect(getHeroTimeScene(new Date(2026, 8, 2, 6, 0))).toEqual({
      phase: 'dawn',
      sunX: 8,
      sunY: 68,
      sunOpacity: 1,
    });
  });

  it('places the sun high over the scene at local noon', () => {
    expect(getHeroTimeScene(new Date(2026, 8, 2, 12, 0))).toEqual({
      phase: 'day',
      sunX: 50,
      sunY: 18,
      sunOpacity: 1,
    });
  });

  it('darkens the scene and hides the sun after local sunset', () => {
    expect(getHeroTimeScene(new Date(2026, 8, 2, 21, 0))).toEqual({
      phase: 'night',
      sunX: 92,
      sunY: 68,
      sunOpacity: 0,
    });
  });
});
