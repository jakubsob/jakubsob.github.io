import { defineCollection, z } from 'astro:content';

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
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
	}),
});

export const collections = { blog };
