import { defineCollection, z } from 'astro:content';

// Define allowed tags
const allowedTags = [
  'bdd',
  'cucumber',
  'llm',
  'plumber',
  'r',
  'resource',
  'shiny',
  'shinytest2',
  'tdd',
  'tests',
  'ui',
] as const;

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
    titleSEO: z.string().optional(),
    description: z.string().optional(),
    descriptionSEO: z.string().optional(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
    tags: z.array(z.enum(allowedTags)),
    draft: z.boolean().optional(),
	}),
});

export const collections = { blog };
