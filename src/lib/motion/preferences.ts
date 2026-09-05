export function motionAllowed(query?: Pick<MediaQueryList, 'matches'>): boolean {
  const preference =
    query ??
    (typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(prefers-reduced-motion: reduce)')
      : undefined);

  return preference ? !preference.matches : false;
}
