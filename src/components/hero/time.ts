export type HeroTimePhase = 'dawn' | 'day' | 'evening' | 'night';

export interface HeroTimeScene {
  phase: HeroTimePhase;
  sunX: number;
  sunY: number;
  sunOpacity: number;
}

const SUNRISE_HOUR = 6;
const SUNSET_HOUR = 18;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getHeroTimeScene(date: Date): HeroTimeScene {
  const hour = date.getHours() + date.getMinutes() / 60;
  const daylightProgress = Math.min(
    1,
    Math.max(0, (hour - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR)),
  );

  const phase: HeroTimePhase =
    hour < 6 || hour >= 20 ? 'night' : hour < 8 ? 'dawn' : hour < 17 ? 'day' : 'evening';

  return {
    phase,
    sunX: round(8 + daylightProgress * 84),
    sunY: round(68 - Math.sin(daylightProgress * Math.PI) * 50),
    sunOpacity: phase === 'night' ? 0 : 1,
  };
}
