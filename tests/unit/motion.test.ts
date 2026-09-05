import { afterEach, describe, expect, it, vi } from 'vitest';
import { enhanceMotion } from '../../src/lib/motion/enhance';
import { motionAllowed } from '../../src/lib/motion/preferences';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('motionAllowed', () => {
  it('allows enhancement when no reduction is requested', () => {
    expect(motionAllowed({ matches: false } as MediaQueryList)).toBe(true);
  });

  it('blocks enhancement when reduction is requested', () => {
    expect(motionAllowed({ matches: true } as MediaQueryList)).toBe(false);
  });

  it('queries the operating-system preference by default', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );

    expect(motionAllowed()).toBe(false);
  });
});

describe('enhanceMotion', () => {
  it('leaves reveal targets untouched when reduced motion is requested', async () => {
    document.body.innerHTML = '<h1 data-reveal="hero">Readable first frame</h1>';
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );

    await enhanceMotion(document);

    expect(document.querySelector('[data-reveal]')).not.toHaveAttribute('data-motion-state');
  });

  it('marks reveal targets once so repeated page-load events do not replay them', async () => {
    document.body.innerHTML = '<h1 data-reveal="hero">Coordinated entrance</h1>';
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );

    await enhanceMotion(document);
    const target = document.querySelector('[data-reveal]');
    expect(target).toHaveAttribute('data-motion-state', 'enhanced');

    await enhanceMotion(document);
    expect(target).toHaveAttribute('data-motion-state', 'enhanced');
  });
});
