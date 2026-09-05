import { describe, expect, it } from 'vitest';
import type { Profile } from '../../src/data/profile';
import { buildContactLinks, getGalleryHref } from '../../src/lib/homepage-state';

const configuredProfile: Profile = {
  name: 'Test Owner',
  headline: 'AI Engineer',
  introduction: 'This test-only biography is long enough to exercise configured profile behavior.',
  availability: 'Open to relevant roles.',
  experience: [],
  capabilities: [{ label: 'Evaluation', detail: 'Tests model behavior against explicit goals.' }],
  interestsIntroduction: 'Photography is included only to exercise the gallery link guard.',
  links: {
    email: 'owner@example.com',
    github: 'https://github.com/test-owner',
    linkedin: 'https://www.linkedin.com/in/test-owner',
  },
};

describe('homepage configured-profile state', () => {
  it('omits the gallery link until the gallery route exists', () => {
    expect(getGalleryHref(configuredProfile, false, '/portfolio-site')).toBeUndefined();
    expect(getGalleryHref(configuredProfile, true, '/portfolio-site')).toBe(
      '/portfolio-site/gallery/',
    );
  });

  it('gives configured external contact links safe browser attributes', () => {
    expect(buildContactLinks(configuredProfile)).toEqual([
      { label: 'Email', href: 'mailto:owner@example.com' },
      {
        label: 'GitHub',
        href: 'https://github.com/test-owner',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/test-owner',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ]);
  });
});
