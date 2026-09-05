import { describe, expect, it } from 'vitest';
import { withBase } from '../../src/lib/url';

describe('withBase', () => {
  it.each([
    ['/', '/', '/'],
    ['/projects/example/', '/', '/projects/example/'],
    ['/projects/example/', '/portfolio-site', '/portfolio-site/projects/example/'],
    ['#projects', '/portfolio-site', '#projects'],
    ['https://example.com', '/portfolio-site', 'https://example.com'],
  ])('maps %s under %s', (path, base, expected) => {
    expect(withBase(path, base)).toBe(expected);
  });
});
