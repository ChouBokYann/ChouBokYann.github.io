import { getCollection, type CollectionEntry } from 'astro:content';

interface OrderedProject {
  id: string;
  data: {
    published: boolean;
    featured: boolean;
    order: number;
  };
}

function byOrderThenId(a: OrderedProject, b: OrderedProject): number {
  return a.data.order - b.data.order || a.id.localeCompare(b.id);
}

export function publishedProjects<T extends OrderedProject>(entries: readonly T[]): T[] {
  return entries.filter((entry) => entry.data.published).sort(byOrderThenId);
}

export function featuredProjects<T extends OrderedProject>(entries: readonly T[]): T[] {
  return publishedProjects(entries).filter((entry) => entry.data.featured);
}

export function projectStaticPaths<T extends OrderedProject>(entries: readonly T[]) {
  return publishedProjects(entries).map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

export async function getPublishedProjects(): Promise<CollectionEntry<'projects'>[]> {
  return publishedProjects(await getCollection('projects'));
}
