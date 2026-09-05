import { z } from 'astro/zod';

const nonEmpty = z.string().trim().min(1);

export const metricSchema = z.object({
  label: nonEmpty,
  value: nonEmpty,
  context: nonEmpty,
});

export const codeNoteSchema = z.object({
  label: nonEmpty,
  detail: nonEmpty,
});

export const projectMetadataSchema = z.object({
  title: nonEmpty,
  summary: nonEmpty,
  outcome: nonEmpty,
  role: nonEmpty,
  date: z.coerce.date(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative(),
  stack: z.array(nonEmpty).min(1),
  architecture: z.array(nonEmpty).min(1),
  metrics: z.array(metricSchema),
  codeNotes: z.array(codeNoteSchema),
  thumbnailAlt: nonEmpty,
  mediumUrl: z.string().url().optional(),
  repositoryUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
});

export const galleryMetadataSchema = z.object({
  title: nonEmpty,
  alt: nonEmpty,
  location: nonEmpty,
  takenAt: z.coerce.date().optional(),
  tags: z.array(nonEmpty),
  published: z.boolean().default(false),
  order: z.number().int().nonnegative(),
});

export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
export type GalleryMetadata = z.infer<typeof galleryMetadataSchema>;
