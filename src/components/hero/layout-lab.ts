export const HERO_LAYOUT_LAYERS = [
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
] as const;

export const HERO_LAYOUT_VERSION = 2;

export type HeroLayoutLayer = (typeof HERO_LAYOUT_LAYERS)[number];
export type HeroLayoutBreakpoint = 'compact' | 'wide';

export interface HeroLayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HeroLayout = Partial<Record<HeroLayoutLayer, HeroLayoutRect>>;
export type ResponsiveHeroLayouts = Partial<Record<HeroLayoutBreakpoint, HeroLayout>>;

interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface PixelDelta {
  x: number;
  y: number;
}

interface PixelSize {
  width: number;
  height: number;
}

const round = (value: number): number => Math.round(value * 1000) / 1000;
const asPercent = (value: number, total: number): number => round((value / total) * 100);

export function getHeroLayoutBreakpoint(viewportWidth: number): HeroLayoutBreakpoint {
  return viewportWidth < 768 ? 'compact' : 'wide';
}

export function rectToHeroLayout(layer: PixelRect, stage: PixelRect): HeroLayoutRect {
  return {
    x: asPercent(layer.left - stage.left, stage.width),
    y: asPercent(layer.top - stage.top, stage.height),
    width: asPercent(layer.width, stage.width),
    height: asPercent(layer.height, stage.height),
  };
}

export function moveHeroLayoutRect(
  rect: HeroLayoutRect,
  delta: PixelDelta,
  stage: PixelSize,
): HeroLayoutRect {
  return {
    ...rect,
    x: round(rect.x + asPercent(delta.x, stage.width)),
    y: round(rect.y + asPercent(delta.y, stage.height)),
  };
}

export function resizeHeroLayoutRect(
  rect: HeroLayoutRect,
  delta: PixelDelta,
  stage: PixelSize,
): HeroLayoutRect {
  return {
    ...rect,
    width: Math.max(2, round(rect.width + asPercent(delta.x, stage.width))),
    height: Math.max(2, round(rect.height + asPercent(delta.y, stage.height))),
  };
}

export function serializeHeroLayouts(layouts: ResponsiveHeroLayouts): string {
  return JSON.stringify(
    {
      version: HERO_LAYOUT_VERSION,
      units: '%',
      breakpoints: layouts,
    },
    null,
    2,
  );
}
