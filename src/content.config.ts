import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: () =>
        z.object({
          track: z.string().optional(),
          chapter: z.number().optional(),
          prerequisites: z.array(z.string()).optional(),
          sims: z.array(z.string()).optional(),
          terms: z.array(z.string()).optional(),
        }),
    }),
  }),
};
