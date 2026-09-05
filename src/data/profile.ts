import { z } from 'astro/zod';
import profileRecord from './profile.json';

const nonEmpty = z.string().trim().min(1);

export const profileSchema = z
  .object({
    name: nonEmpty,
    headline: nonEmpty,
    introduction: z.string().trim().min(40),
    location: nonEmpty.optional(),
    availability: nonEmpty,
    experience: z.array(
      z
        .object({
          title: nonEmpty,
          organization: nonEmpty,
          period: nonEmpty,
          summary: nonEmpty,
        })
        .strict(),
    ),
    capabilities: z.array(z.object({ label: nonEmpty, detail: nonEmpty }).strict()).min(1),
    interestsIntroduction: nonEmpty,
    links: z
      .object({
        email: z.email().optional(),
        github: z.url().optional(),
        linkedin: z.url().optional(),
        medium: z.url().optional(),
        instagram: z.url().optional(),
      })
      .strict(),
  })
  .strict();

const profileRecordSchema = profileSchema.nullable();

export const profile = profileRecordSchema.parse(profileRecord);
export type Profile = z.infer<typeof profileSchema>;
