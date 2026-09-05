import type { Profile } from '../data/profile';
import { withBase } from './url';

export interface ContactLink {
  label: string;
  href: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
}

function externalContactLink(label: string, href: string): ContactLink {
  return {
    label,
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

export function buildContactLinks(profile: Profile | null): ContactLink[] {
  if (!profile) return [];

  return [
    profile.links.email && { label: 'Email', href: `mailto:${profile.links.email}` },
    profile.links.github && externalContactLink('GitHub', profile.links.github),
    profile.links.linkedin && externalContactLink('LinkedIn', profile.links.linkedin),
    profile.links.medium && externalContactLink('Medium', profile.links.medium),
    profile.links.instagram && externalContactLink('Instagram', profile.links.instagram),
  ].filter((link): link is ContactLink => Boolean(link));
}

export function getGalleryHref(
  profile: Profile | null,
  galleryRouteAvailable: boolean,
  base = import.meta.env.BASE_URL,
): string | undefined {
  return profile && galleryRouteAvailable ? withBase('/gallery/', base) : undefined;
}
