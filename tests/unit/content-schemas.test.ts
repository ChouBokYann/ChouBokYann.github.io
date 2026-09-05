import { describe, expect, it } from 'vitest';
import { galleryMetadataSchema, projectMetadataSchema } from '../../src/content/schemas';

describe('content schemas', () => {
  it('rejects project metrics without a label, value, and context', () => {
    const result = projectMetadataSchema.safeParse({
      title: 'Fixture recommender',
      summary: 'A test-only project record.',
      outcome: 'Used only to validate parsing.',
      role: 'Test fixture',
      date: '2026-01-01',
      published: false,
      featured: false,
      order: 1,
      stack: ['Python'],
      architecture: ['offline evaluation'],
      metrics: [{ label: 'Recall' }],
      codeNotes: [],
      thumbnailAlt: 'Abstract test fixture diagram',
    });

    expect(result.success).toBe(false);
  });

  it('requires gallery alt text and location', () => {
    const result = galleryMetadataSchema.safeParse({
      title: 'Fixture photograph',
      alt: '',
      location: '',
      takenAt: '2026-01-01',
      tags: ['fixture'],
      published: false,
      order: 1,
    });

    expect(result.success).toBe(false);
  });
});
