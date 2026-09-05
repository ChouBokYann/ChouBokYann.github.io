import { describe, expect, it } from 'vitest';
import { assessPublicationReadiness } from '../../scripts/check-publication-readiness.mjs';

const configuredProfile = {
  name: 'Test Owner',
  links: {},
};

describe('public publication readiness', () => {
  it('accepts owner content, a public canonical URL, and an unencrypted PDF', () => {
    expect(
      assessPublicationReadiness({
        profile: configuredProfile,
        siteUrl: 'https://portfolio.example',
        resume: Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\n%%EOF'),
      }),
    ).toEqual([]);
  });

  it('reports every missing owner-content requirement instead of publishing a preview', () => {
    expect(
      assessPublicationReadiness({
        profile: null,
        siteUrl: 'http://localhost:4321',
        resume: null,
      }),
    ).toEqual([
      'Owner-approved profile content is required.',
      'SITE_URL must be an owner-approved public HTTPS URL.',
    ]);
  });

  it('rejects a password-protected résumé', () => {
    expect(
      assessPublicationReadiness({
        profile: configuredProfile,
        siteUrl: 'https://portfolio.example',
        resume: Buffer.from('%PDF-1.7\n<< /Encrypt 4 0 R >>'),
      }),
    ).toContain('public/resume.pdf must not be password protected.');
  });
  it('allows the owner-approved release without a downloadable résumé', () => {
    expect(assessPublicationReadiness({profile: configuredProfile, siteUrl: 'https://choubokyann.github.io', resume: null})).toEqual([]);
  });
});
