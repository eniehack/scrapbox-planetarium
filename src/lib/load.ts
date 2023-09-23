import { z } from 'zod';

export const schema = z.object({
	exported: z.number(),
	pages: z.array(
		z.object({
			title: z.string(),
			created: z.number(),
			updated: z.number(),
			id: z.string(),
			linksLc: z.array(z.string())
		})
	)
});

export type SchemaType = z.infer<typeof schema>;
