import { db, schema } from "@flomingo/db";
import { generatePresignedUploadUrl, getPublicUrl } from "@flomingo/utils/s3";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { authed, pub } from "../procedures";

function mapAttachment(a: typeof schema.attachments.$inferSelect) {
	return {
		id: a.id,
		postId: a.postId,
		type: a.type,
		url: a.url,
		thumbnailUrl: a.thumbnailUrl,
		order: a.order,
		ogTitle: a.ogTitle,
		ogDescription: a.ogDescription,
		ogImageUrl: a.ogImageUrl,
		createdAt: a.createdAt.getTime(),
	};
}

export const presignAttachment = authed.attachment.presign.handler(async ({ input }) => {
	const { filename, contentType, type, postId } = input;
	const ext = filename.split(".").pop()?.toLowerCase() || (contentType === "image/gif" ? "gif" : "jpg");
	const timestamp = Date.now();
	const id = crypto.randomUUID().slice(0, 8);
	const folder = type === "gif" ? "gifs" : "images";
	const key = `${folder}/${postId}/${timestamp}-${id}.${ext}`;

	return {
		uploadUrl: generatePresignedUploadUrl(key),
		key,
		url: getPublicUrl(key),
	};
});

export const createAttachment = authed.attachment.create.handler(async ({ input, context }) => {
	const post = await db.query.posts.findFirst({
		where: (posts, { eq }) => eq(posts.id, input.postId),
	});

	if (!post) throw new ORPCError("NOT_FOUND", { message: "Post not found" });
	if (post.authorId !== context.user.id) throw new ORPCError("FORBIDDEN", { message: "Not authorized" });

	const [attachment] = await db.insert(schema.attachments).values(input).returning();
	if (!attachment) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create attachment" });

	return mapAttachment(attachment);
});

export const listAttachmentsByPost = pub.attachment.byPost.handler(async ({ input }) => {
	const attachments = await db.query.attachments.findMany({
		where: (a, { eq }) => eq(a.postId, input.postId),
		orderBy: (a, { asc }) => asc(a.order),
	});

	return attachments.map(mapAttachment);
});

export const deleteAttachment = authed.attachment.delete.handler(async ({ input, context }) => {
	const attachment = await db.query.attachments.findFirst({
		where: (a, { eq }) => eq(a.id, input.id),
	});

	if (!attachment) throw new ORPCError("NOT_FOUND", { message: "Attachment not found" });

	const post = await db.query.posts.findFirst({
		where: (posts, { eq }) => eq(posts.id, attachment.postId),
	});

	if (!post || post.authorId !== context.user.id) throw new ORPCError("FORBIDDEN", { message: "Not authorized" });

	await db.delete(schema.attachments).where(eq(schema.attachments.id, input.id));

	return { success: true };
});

export const attachmentRouter = {
	presign: presignAttachment,
	create: createAttachment,
	byPost: listAttachmentsByPost,
	delete: deleteAttachment,
};
