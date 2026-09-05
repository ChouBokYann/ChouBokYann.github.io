import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import process from 'node:process';
import { galleryMetadataSchema, projectMetadataSchema } from './content/schemas';

const projectsBase =
  process.env.PROJECT_ROUTE_E2E === '1' ? './tests/fixtures/projects' : './src/data/projects';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: projectsBase }),
  schema: ({ image }) => projectMetadataSchema.and(z.object({ thumbnail: image() })),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/gallery' }),
  schema: ({ image }) => galleryMetadataSchema.and(z.object({ image: image() })),
});

export const collections = { projects, gallery };
