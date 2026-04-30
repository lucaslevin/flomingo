import { oc } from "@orpc/contract";
import { z } from "zod";

export const feedContract = {
	list: oc
		.input(
			z.object({
				type: z.enum(["foryou", "following"]).default("foryou"),
				userId: z.string().optional(),
				limit: z.number().int().min(1).max(100).default(20),
				cursor: z.number().int().min(0).default(0),
			}),
		)
		.output(
			z.object({
				posts: z.array(
					z.object({
						id: z.string(),
						title: z.string(),
						authorId: z.string(),
						authorName: z.string(),
						communityId: z.string(),
						communitySlug: z.string(),
						createdAt: z.number(),
						score: z.number(),
						commentCount: z.number(),
						bookmarkCount: z.number(),
						attachments: z
							.array(
								z.object({
									id: z.string(),
									type: z.string(),
									url: z.string(),
									thumbnailUrl: z.string().nullable(),
									order: z.number(),
								}),
							)
							.optional(),
					}),
				),
				nextCursor: z.number().nullable(),
			}),
		),
};
