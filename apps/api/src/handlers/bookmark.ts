import { db, schema } from "@flomingo/db";
import { and, eq, sql } from "drizzle-orm";
import { authed } from "../procedures";

export const createBookmark = authed.bookmark.create.handler(async ({ input, context }) => {
	const existing = await db
		.select()
		.from(schema.bookmarks)
		.where(and(eq(schema.bookmarks.userId, context.user.id), eq(schema.bookmarks.targetId, input.targetId), eq(schema.bookmarks.targetType, input.targetType)))
		.limit(1);

	if (existing[0]) {
		return { success: true };
	}

	await db.insert(schema.bookmarks).values({
		userId: context.user.id,
		targetId: input.targetId,
		targetType: input.targetType,
	});

	return { success: true };
});

type BookmarkPostResult = {
	type: "post";
	id: string;
	targetId: string;
	title: string;
	content: string;
	authorId: string;
	authorName: string;
	communityId: string;
	communitySlug: string;
	createdAt: number;
	bookmarkedAt: number;
};

type BookmarkCommentResult = {
	type: "comment";
	id: string;
	targetId: string;
	content: string;
	authorId: string;
	authorName: string;
	postId: string;
	createdAt: number;
	bookmarkedAt: number;
};

type BookmarkResult = BookmarkPostResult | BookmarkCommentResult;

export const listBookmark = authed.bookmark.list.handler(async ({ input, context }) => {
	const limit = input.limit ?? 20;
	const cursor = input.cursor ?? 0;

	const userBookmarks = await db
		.select()
		.from(schema.bookmarks)
		.where(eq(schema.bookmarks.userId, context.user.id))
		.orderBy((t) => sql`${t.createdAt} DESC`)
		.limit(limit + 1);

	const hasMore = userBookmarks.length > limit;
	const results = hasMore ? userBookmarks.slice(0, -1) : userBookmarks;

	const bookmarkResults: BookmarkResult[] = [];

	for (const bookmark of results) {
		if (bookmark.targetType === "post") {
			const post = await db.query.posts.findFirst({
				where: (posts, { eq }) => eq(posts.id, bookmark.targetId),
				with: {
					author: true,
					community: true,
				},
			});

			if (post) {
				bookmarkResults.push({
					type: "post",
					id: bookmark.id,
					targetId: bookmark.targetId,
					title: post.title,
					content: post.content,
					authorId: post.authorId,
					authorName: post.author.name,
					communityId: post.communityId,
					communitySlug: post.community.slug,
					createdAt: post.createdAt.getTime(),
					bookmarkedAt: bookmark.createdAt.getTime(),
				});
			}
		} else if (bookmark.targetType === "comment") {
			const comment = await db.query.comments.findFirst({
				where: (comments, { eq }) => eq(comments.id, bookmark.targetId),
				with: { author: true },
			});

			if (comment) {
				bookmarkResults.push({
					type: "comment",
					id: bookmark.id,
					targetId: bookmark.targetId,
					content: comment.content,
					authorId: comment.authorId,
					authorName: comment.author.name,
					postId: comment.postId,
					createdAt: comment.createdAt.getTime(),
					bookmarkedAt: bookmark.createdAt.getTime(),
				});
			}
		}
	}

	return {
		bookmarks: bookmarkResults,
		nextCursor: hasMore ? cursor + limit : null,
	};
});

export const deleteBookmark = authed.bookmark.delete.handler(async ({ input, context }) => {
	await db.delete(schema.bookmarks).where(and(eq(schema.bookmarks.targetId, input.targetId), eq(schema.bookmarks.userId, context.user.id)));

	return { success: true };
});

export const bookmarkRouter = {
	create: createBookmark,
	list: listBookmark,
	delete: deleteBookmark,
};
