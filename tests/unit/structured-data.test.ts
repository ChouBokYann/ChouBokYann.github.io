import { describe, expect, it } from 'vitest';
import { personJsonLd, projectJsonLd, serializeJsonLd } from '../../src/lib/seo/structured-data';

describe('structured data', () => {
  it('maps only supplied profile links into sameAs', () => {
    const result = personJsonLd({
      name: 'Test Owner',
      headline: 'AI Engineer',
      introduction: 'A test-only profile used to validate JSON-LD output.',
      availability: 'Test availability',
      experience: [],
      capabilities: [{ label: 'Evaluation', detail: 'Test detail' }],
      interestsIntroduction: 'Test interests',
      links: {
        github: 'https://github.com/example',
        medium: 'https://medium.com/@example',
      },
    });

    expect(result.sameAs).toEqual(['https://github.com/example', 'https://medium.com/@example']);
  });

  it('omits optional Person properties when the profile does not supply them', () => {
    const result = personJsonLd({
      name: 'Test Owner',
      headline: 'AI Engineer',
      introduction: 'A test-only profile used to validate JSON-LD output.',
      availability: 'Test availability',
      experience: [],
      capabilities: [{ label: 'Evaluation', detail: 'Test detail' }],
      interestsIntroduction: 'Test interests',
      links: {},
    });

    expect(result).not.toHaveProperty('homeLocation');
    expect(result.sameAs).toEqual([]);
  });

  it('describes a project as CreativeWork with an ISO date', () => {
    expect(
      projectJsonLd({
        title: 'Fixture',
        summary: 'Test summary',
        date: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ).toMatchObject({
      '@type': 'CreativeWork',
      name: 'Fixture',
      dateCreated: '2026-01-01T00:00:00.000Z',
    });
  });

  it('escapes markup-significant characters before JSON-LD reaches HTML', () => {
    expect(serializeJsonLd({ description: '</script><script>alert(1)</script>' })).toBe(
      '{"description":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}',
    );
  });
});
