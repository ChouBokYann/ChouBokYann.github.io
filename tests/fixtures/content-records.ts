import type { GalleryMetadata, ProjectMetadata } from '../../src/content/schemas';

export const projectRecords = [
  {
    id: 'draft-project',
    data: { published: false, featured: true, order: 0 } as ProjectMetadata,
  },
  {
    id: 'second-project',
    data: { published: true, featured: false, order: 2 } as ProjectMetadata,
  },
  {
    id: 'first-project',
    data: { published: true, featured: true, order: 1 } as ProjectMetadata,
  },
  {
    id: 'zebra-project',
    data: { published: true, featured: false, order: 3 } as ProjectMetadata,
  },
  {
    id: 'alpha-project',
    data: { published: true, featured: false, order: 3 } as ProjectMetadata,
  },
];

export const galleryRecords = [
  { id: 'draft-photo', data: { published: false, order: 0 } as GalleryMetadata },
  { id: 'second-photo', data: { published: true, order: 2 } as GalleryMetadata },
  { id: 'first-photo', data: { published: true, order: 1 } as GalleryMetadata },
  { id: 'zebra-photo', data: { published: true, order: 3 } as GalleryMetadata },
  { id: 'alpha-photo', data: { published: true, order: 3 } as GalleryMetadata },
];
