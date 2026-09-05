import { describe, expect, it } from 'vitest';
import { profile, profileSchema } from '../../src/data/profile';

const validProfile = {
  name: 'Test Owner',
  headline: 'AI Engineer',
  introduction: 'This test-only biography is long enough to exercise validation behavior.',
  availability: 'Open to relevant roles.',
  experience: [],
  capabilities: [{ label: 'Evaluation', detail: 'Tests model behavior against explicit goals.' }],
  interestsIntroduction: 'Japan, photography, and animation shape the visual direction.',
  links: {},
};

describe('profileSchema', () => {
  it('requires identity, positioning, and substantive introduction copy', () => {
    const result = profileSchema.safeParse({
      name: '',
      headline: 'AI Engineer',
      introduction: 'Too short.',
      availability: '',
      experience: [],
      capabilities: [],
      interestsIntroduction: '',
      links: {},
    });

    expect(result.success).toBe(false);
  });

  it('rejects malformed outbound URLs', () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      links: { github: 'not-a-url' },
    });

    expect(result.success).toBe(false);
  });

  it('rejects unknown profile claims', () => {
    const result = profileSchema.safeParse({ ...validProfile, inventedMetric: '99%' });

    expect(result.success).toBe(false);
  });

  it('validates the configured owner profile and rejects null', () => {
    expect(profileSchema.safeParse(profile).success).toBe(true);
    expect(profile?.name).toBe('Bok Yann');
    expect(profileSchema.safeParse(null).success).toBe(false);
  });
});
