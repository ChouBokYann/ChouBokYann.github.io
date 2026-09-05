import { describe, expect, it } from 'vitest';
import {
  HERO_LAYOUT_LAYERS,
  getHeroLayoutBreakpoint,
  moveHeroLayoutRect,
  rectToHeroLayout,
  resizeHeroLayoutRect,
  HERO_LAYOUT_VERSION,
  serializeHeroLayouts,
} from '../../src/components/hero/layout-lab';

describe('hero layout lab geometry', () => {
  it('exposes every independent v2 scene layer for layout editing', () => {
    expect(HERO_LAYOUT_LAYERS).toEqual([
      'sky',
      'clouds',
      'lake',
      'distant-town',
      'fuji',
      'right-bank',
      'houses',
      'left-sakura',
      'torii',
      'dock',
      'bok-yann',
      'near-sakura',
      'title',
    ]);
  });

  it('converts rendered rectangles into viewport-relative percentages', () => {
    expect(
      rectToHeroLayout(
        { left: 160, top: 120, width: 320, height: 180 },
        { left: 100, top: 40, width: 1200, height: 800 },
      ),
    ).toEqual({ x: 5, y: 10, width: 26.667, height: 22.5 });
  });

  it('moves a layer in relative units without losing off-canvas placement', () => {
    expect(
      moveHeroLayoutRect(
        { x: -6, y: 54, width: 52, height: 42 },
        { x: -120, y: 40 },
        { width: 1200, height: 800 },
      ),
    ).toEqual({ x: -16, y: 59, width: 52, height: 42 });
  });

  it('resizes from the lower-right corner with a usable minimum size', () => {
    expect(
      resizeHeroLayoutRect(
        { x: 10, y: 15, width: 20, height: 30 },
        { x: -500, y: -500 },
        { width: 1000, height: 1000 },
      ),
    ).toEqual({ x: 10, y: 15, width: 2, height: 2 });
  });

  it('uses the same breakpoint as the hero mobile layout', () => {
    expect(getHeroLayoutBreakpoint(767)).toBe('compact');
    expect(getHeroLayoutBreakpoint(768)).toBe('wide');
  });
});

describe('hero layout lab export', () => {
  it('versions exports independently from the retired phase-one layer set', () => {
    expect(HERO_LAYOUT_VERSION).toBe(2);
  });

  it('exports stable percentage-only responsive layout data', () => {
    expect(
      serializeHeroLayouts({
        compact: {
          sky: { x: 0, y: 0, width: 100, height: 100 },
        },
        wide: {
          fuji: { x: 15.25, y: 30, width: 12.5, height: 18.75 },
        },
      }),
    ).toBe(`{
  "version": 2,
  "units": "%",
  "breakpoints": {
    "compact": {
      "sky": {
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100
      }
    },
    "wide": {
      "fuji": {
        "x": 15.25,
        "y": 30,
        "width": 12.5,
        "height": 18.75
      }
    }
  }
}`);
  });
});
