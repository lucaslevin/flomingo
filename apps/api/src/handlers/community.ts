import { db, schema } from "@flomingo/db";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { authed, pub } from "../procedures";

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export const listCommunity = pub.community.list.handler(async ({ input }) => {
	const limit = input.limit ?? 20;
	const cursor = input.cursor ?? 0;

	const communities = await db.query.communities.findMany({
		orderBy: (communities, { desc }) => desc(communities.createdAt),
		limit: limit + 1,
		offset: cursor,
	});

	const hasMore = communities.length > limit;
	const results = hasMore ? communities.slice(0, -1) : communities;

	return {
		communities: results.map((c) => ({
			id: c.id,
			name: c.name,
			slug: c.slug,
			description: c.description,
			createdAt: c.createdAt.getTime(),
		})),
		nextCursor: hasMore ? cursor + limit : null,
	};
});

export const bySlugCommunity = pub.community.bySlug.handler(async ({ input }) => {
	const community = await db.query.communities.findFirst({
		where: eq(schema.communities.slug, input.slug),
	});

	if (!community) {
		throw new ORPCError("NOT_FOUND", { message: "Community not found" });
	}

	return {
		id: community.id,
		name: community.name,
		slug: community.slug,
		description: community.description,
		guidelines: community.guidelines,
		createdAt: community.createdAt.getTime(),
	};
});

export const createCommunity = authed.community.create.handler(async ({ input }) => {
	const slug = slugify(input.name);

	const existing = await db.query.communities.findFirst({
		where: eq(schema.communities.slug, slug),
	});

	if (existing) {
		throw new ORPCError("CONFLICT", { message: "Community already exists" });
	}

	await db.insert(schema.communities).values({
		name: input.name,
		slug,
		description: input.description,
	});

	const community = await db.query.communities.findFirst({
		where: eq(schema.communities.slug, slug),
	});

	if (!community) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create community" });
	}

	return {
		id: community.id,
		name: community.name,
		slug: community.slug,
		description: community.description,
		createdAt: community.createdAt.getTime(),
	};
});

export const communityRouter = {
	list: listCommunity,
	bySlug: bySlugCommunity,
	create: createCommunity,
};
