import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const communityFollowers = pgTable(
	"communityFollowers",
	{
		id: text("id").$defaultFn(() => nanoid()).primaryKey(),
		userId: text("userId").notNull(),
		communityId: text("communityId").notNull(),
		createdAt: timestamp("createdAt").notNull().$defaultFn(() => new Date()),
	},
	(table) => [
		uniqueIndex("communityFollowers_user_community_idx").on(table.userId, table.communityId),
		index("communityFollowers_user_idx").on(table.userId),
		index("communityFollowers_community_idx").on(table.communityId),
	],
);

export const userFollows = pgTable(
	"userFollows",
	{
		id: text("id").$defaultFn(() => nanoid()).primaryKey(),
		followerId: text("followerId").notNull(),
		followingId: text("followingId").notNull(),
		createdAt: timestamp("createdAt").notNull().$defaultFn(() => new Date()),
	},
	(table) => [
		uniqueIndex("userFollows_unique_idx").on(table.followerId, table.followingId),
		index("userFollows_follower_idx").on(table.followerId),
		index("userFollows_following_idx").on(table.followingId),
	],
);