import { describe, expect, it } from 'vitest';
import { galleryRecords, projectRecords } from '../fixtures/content-records';
import { publishedGalleryItems } from '../../src/lib/content/gallery';
import {
  featuredProjects,
  projectStaticPaths,
  publishedProjects,
} from '../../src/lib/content/projects';

describe('project selection', () => {
  it('removes drafts and sorts published work', () => {
    expect(publishedProjects(projectRecords).map(({ id }) => id)).toEqual([
      'first-project',
      'second-project',
      'alpha-project',
      'zebra-project',
    ]);
  });

  it('uses IDs to break equal-order published work ties', () => {
    expect(publishedProjects(projectRecords).map(({ id }) => id)).toEqual([
      'first-project',
      'second-project',
      'alpha-project',
      'zebra-project',
    ]);
  });

  it('selects featured work from the public set only', () => {
    expect(featuredProjects(projectRecords).map(({ id }) => id)).toEqual(['first-project']);
  });

  it('creates no static path for a draft', () => {
    expect(projectStaticPaths(projectRecords).map(({ params }) => params.slug)).toEqual([
      'first-project',
      'second-project',
      'alpha-project',
      'zebra-project',
    ]);
  });
});

describe('gallery selection', () => {
  it('removes drafts and sorts photographs', () => {
    expect(publishedGalleryItems(galleryRecords).map(({ id }) => id)).toEqual([
      'first-photo',
      'second-photo',
      'alpha-photo',
      'zebra-photo',
    ]);
  });

  it('uses IDs to break equal-order published photograph ties', () => {
    expect(publishedGalleryItems(galleryRecords).map(({ id }) => id)).toEqual([
      'first-photo',
      'second-photo',
      'alpha-photo',
      'zebra-photo',
    ]);
  });
});
