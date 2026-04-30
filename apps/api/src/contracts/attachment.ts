import { oc } from "@orpc/contract";
import { z } from "zod";

const attachmentType = z.union([z.literal("image"), z.literal("gif"), z.literal("link")]);

const attachmentFields = z.object({
	id: z.string(),
	postId: z.string(),
	type: z.string(),
	url: z.string(),
	thumbnailUrl: z.string().nullable(),
	order: z.number(),
	ogTitle: z.string().nullable(),
	ogDescription: z.string().nullable(),
	ogImageUrl: z.string().nullable(),
	createdAt: z.number(),
});

export const attachmentContract = {
	presign: oc
		.input(
			z.object({
				postId: z.string(),
				filename: z.string(),
				contentType: z.string(),
				type: attachmentType,
			}),
		)
		.output(
			z.object({
				uploadUrl: z.string(),
				key: z.string(),
				url: z.string(),
			}),
		),

	create: oc
		.input(
			z.object({
				postId: z.string(),
				type: attachmentType,
				url: z.string().url(),
				thumbnailUrl: z.string().url().optional(),
				s3Key: z.string().optional(),
				order: z.number().int().min(0).default(0),
				ogTitle: z.string().optional(),
				ogDescription: z.string().optional(),
				ogImageUrl: z.string().url().optional(),
			}),
		)
		.output(attachmentFields),

	byPost: oc.input(z.object({ postId: z.string() })).output(z.array(attachmentFields)),

	delete: oc.input(z.object({ id: z.string() })).output(z.object({ success: z.boolean() })),
};
