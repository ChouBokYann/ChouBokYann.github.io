import type { Profile } from '@/data/profile';

export function personJsonLd(profile: Profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.headline,
    description: profile.introduction,
    ...(profile.location ? { homeLocation: profile.location } : {}),
    sameAs: [profile.links.github, profile.links.linkedin, profile.links.medium].filter(
      (url): url is string => Boolean(url),
    ),
  };
}

export function projectJsonLd(project: { title: string; summary: string; date: Date }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    dateCreated: project.date.toISOString(),
  };
}

export function serializeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
