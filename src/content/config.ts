import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().default(false),
    date: z.coerce.date(),
  }),
});

export const collections = { blog };
