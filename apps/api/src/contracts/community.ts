import { schema } from "@flomingo/db";
import { oc } from "@orpc/contract";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const CommunityInsertSchema = createInsertSchema(schema.communities);

export const communityContract = {
	list: oc
		.input(
			z.object({
				limit: z.number().int().min(1).max(100).default(20),
				cursor: z.number().int().min(0).default(0),
			}),
		)
		.output(
			z.object({
				communities: z.array(
					z.object({
						id: z.string(),
						name: z.string(),
						slug: z.string(),
						description: z.string().nullable(),
						createdAt: z.number(),
					}),
				),
				nextCursor: z.number().nullable(),
			}),
		),

	bySlug: oc.input(z.object({ slug: z.string() })).output(
		z.object({
			id: z.string(),
			name: z.string(),
			slug: z.string(),
			description: z.string().nullable(),
			guidelines: z.string().nullable(),
			createdAt: z.number(),
		}),
	),

	create: oc
		.input(
			CommunityInsertSchema.pick({
				name: true,
				description: true,
			}).extend({
				name: z.string().min(1).max(50),
				description: z.string().max(500).optional(),
			}),
		)
		.output(
			z.object({
				id: z.string(),
				name: z.string(),
				slug: z.string(),
				description: z.string().nullable(),
				createdAt: z.number(),
			}),
		),
};
