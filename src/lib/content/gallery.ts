import { getCollection, type CollectionEntry } from 'astro:content';

interface OrderedGalleryItem {
  id: string;
  data: {
    published: boolean;
    order: number;
  };
}

export function publishedGalleryItems<T extends OrderedGalleryItem>(entries: readonly T[]): T[] {
  return entries
    .filter((entry) => entry.data.published)
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}

export async function getPublishedGalleryItems(): Promise<CollectionEntry<'gallery'>[]> {
  return publishedGalleryItems(await getCollection('gallery'));
}
