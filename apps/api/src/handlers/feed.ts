import { db, schema } from "@flomingo/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { pub } from "../procedures";

export const listFeed = pub.feed.list.handler(async ({ input }) => {
	const limit = input.limit ?? 20;
	const cursor = input.cursor ?? 0;
	const feedType = input.type ?? "foryou";

	const followingFilter = feedType === "following" && input.userId ? await getFollowingFilter(input.userId) : null;

	if (followingFilter === "empty") {
		return { posts: [], nextCursor: null };
	}

	const postsQuery = db.query.posts.findMany({
		where: (posts, { isNull, or, and }) =>
			followingFilter
				? and(isNull(posts.deletedAt), or(inArray(posts.communityId, followingFilter.communityIds), inArray(posts.authorId, followingFilter.userIds)))
				: isNull(posts.deletedAt),
		with: { author: true, community: true, attachments: true },
		orderBy: (posts, { desc }) => desc(posts.createdAt),
		limit: limit + 1,
		offset: cursor,
	});

	const posts = await postsQuery;

	const hasMore = posts.length > limit;
	const results = hasMore ? posts.slice(0, -1) : posts;

	if (results.length === 0) {
		return { posts: [], nextCursor: null };
	}

	const postIds = results.map((p) => p.id);

	const [voteRows, commentRows, bookmarkRows] = await Promise.all([
		db
			.select({ targetId: schema.votes.targetId, score: sql<number>`coalesce(sum(${schema.votes.value}), 0)` })
			.from(schema.votes)
			.where(inArray(schema.votes.targetId, postIds))
			.groupBy(schema.votes.targetId),
		db
			.select({ postId: schema.comments.postId, count: sql<number>`count(*)` })
			.from(schema.comments)
			.where(inArray(schema.comments.postId, postIds))
			.groupBy(schema.comments.postId),
		db
			.select({ targetId: schema.bookmarks.targetId, count: sql<number>`count(*)` })
			.from(schema.bookmarks)
			.where(and(inArray(schema.bookmarks.targetId, postIds), eq(schema.bookmarks.targetType, "post")))
			.groupBy(schema.bookmarks.targetId),
	]);

	const scoreMap = new Map(voteRows.map((v) => [v.targetId, v.score]));
	const commentCountMap = new Map(commentRows.map((c) => [c.postId, c.count]));
	const bookmarkCountMap = new Map(bookmarkRows.map((b) => [b.targetId, b.count]));

	const postsWithCounts = results.map((post) => ({
		id: post.id,
		title: post.title,
		authorId: post.authorId,
		authorName: post.author.name,
		communityId: post.communityId,
		communitySlug: post.community.slug,
		createdAt: Number(post.createdAt.getTime()),
		score: Number(scoreMap.get(post.id)) || 0,
		commentCount: Number(commentCountMap.get(post.id)) || 0,
		bookmarkCount: Number(bookmarkCountMap.get(post.id)) || 0,
		attachments: post.attachments
			? post.attachments
					.sort((a, b) => a.order - b.order)
					.map((a) => ({
						id: a.id,
						type: a.type,
						url: a.url,
						thumbnailUrl: a.thumbnailUrl,
						ogImageUrl: a.ogImageUrl,
						order: a.order,
					}))
			: undefined,
	}));

	return {
		posts: postsWithCounts,
		nextCursor: hasMore ? Number(cursor + limit) : null,
	};
});

async function getFollowingFilter(userId: string) {
	const followingCommunities = await db
		.select({ communityId: schema.communityFollowers.communityId })
		.from(schema.communityFollowers)
		.where(eq(schema.communityFollowers.userId, userId));

	const followingUsers = await db.select({ followingId: schema.userFollows.followingId }).from(schema.userFollows).where(eq(schema.userFollows.followerId, userId));

	const communityIds = followingCommunities.map((c) => c.communityId);
	const userIds = followingUsers.map((u) => u.followingId);

	if (communityIds.length === 0 && userIds.length === 0) {
		return "empty";
	}

	return { communityIds, userIds };
}

export const feedRouter = {
	list: listFeed,
};
