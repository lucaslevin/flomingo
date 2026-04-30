import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { nanoid } from "nanoid";
import * as schema from "./schema";

const client = new SQL(process.env.DATABASE_URL!);
const db = drizzle({ client, schema });

const communities = [
	{ name: "General", slug: "general", description: "General discussions" },
	{ name: "Tech", slug: "tech", description: "Technology discussions" },
	{ name: "Gaming", slug: "gaming", description: "Video games and gaming culture" },
	{ name: "Movies", slug: "movies", description: "Film and cinema discussions" },
	{ name: "AskFlomingo", slug: "askflomingo", description: "Ask the community anything" },
];

const users = [
	{ name: "Alice Johnson", email: "alice@example.com", emailVerified: true },
	{ name: "Bob Smith", email: "bob@example.com", emailVerified: true },
	{ name: "Carol White", email: "carol@example.com", emailVerified: true },
];

const postsData = [
	{ title: "Welcome to Flomingo!", content: "This is the first post on our new platform. Tell us what you think!" },
	{ title: "Best coding practices?", content: "What are your favorite coding practices that have improved your productivity?" },
	{ title: "Gaming setup 2024", content: "Just upgraded my gaming setup. Here are my thoughts on the latest gear." },
	{ title: "Movie recommendations", content: "Looking for good movies to watch this weekend. Any suggestions?" },
	{ title: "Ask me anything", content: "I'm new here! Ask me anything about my experience in tech." },
	{ title: "React vs Vue - thoughts?", content: "Which framework do you prefer and why? Let's discuss!" },
	{ title: "Favorite indie games", content: "I love discovering indie games. What are your favorites?" },
	{ title: "Book club suggestions", content: "Starting a book club. What books should we read first?" },
	{ title: "Productivity tips", content: "Here are my top 5 productivity tips that actually work." },
	{ title: "Music recommendations", content: "What music do you listen to while coding? Share your playlists!" },
];

async function seed() {
	console.log("Seeding database...");

	// Insert communities
	console.log("Creating communities...");
	const communityIds: string[] = [];
	const now = new Date();
	for (const community of communities) {
		const id = nanoid();
		communityIds.push(id);
		await db.insert(schema.communities).values({
			id,
			name: community.name,
			slug: community.slug,
			description: community.description,
			createdAt: now,
			updatedAt: now,
		});
	}
	console.log(`Created ${communities.length} communities`);

	// Insert users
	console.log("Creating users...");
	const userIds: string[] = [];
	for (const user of users) {
		const id = nanoid();
		userIds.push(id);
		await db.insert(schema.users).values({
			id,
			name: user.name,
			email: user.email,
			emailVerified: user.emailVerified,
			createdAt: now,
			updatedAt: now,
		});
	}
	console.log(`Created ${users.length} users`);

	// Insert posts
	console.log("Creating posts...");
	for (let i = 0; i < postsData.length; i++) {
		const post = postsData[i];
		const authorId = userIds[i % userIds.length];
		const communityId = communityIds[i % communityIds.length];
		await db.insert(schema.posts).values({
			id: nanoid(),
			title: post.title,
			content: post.content,
			authorId,
			communityId,
			embedding: Array(1536).fill(0),
			createdAt: now,
			updatedAt: now,
		});
	}
	console.log(`Created ${postsData.length} posts`);

	// Fetch created posts to get their IDs
	const createdPosts = await db.query.posts.findMany({});
	const postIds = createdPosts.map((p) => p.id);

	// Insert comments
	console.log("Creating comments...");
	const commentsData = [
		"Great post! Thanks for sharing.",
		"I totally agree with this.",
		"Interesting perspective. I hadn't thought of that.",
		"Could you elaborate more on this point?",
		"This is exactly what I was looking for!",
		"Not sure I agree, but interesting nonetheless.",
		"Been thinking the same thing lately.",
		"Love this community!",
		"Welcome to the community everyone!",
		"This helped me a lot, thank you!",
	];
	for (let i = 0; i < 20; i++) {
		const postId = postIds[i % postIds.length];
		const authorId = userIds[i % userIds.length];
		await db.insert(schema.comments).values({
			id: nanoid(),
			content: commentsData[i % commentsData.length],
			authorId,
			postId,
			parentCommentId: null,
			depth: 0,
			createdAt: now,
		});
	}
	console.log("Created 20 comments");

	// Insert some votes
	console.log("Creating votes...");
	for (let i = 0; i < 30; i++) {
		const postId = postIds[i % postIds.length];
		const userId = userIds[i % userIds.length];
		const value = Math.random() > 0.3 ? 1 : -1;
		await db.insert(schema.votes).values({
			id: nanoid(),
			userId,
			targetId: postId,
			targetType: "post",
			value,
			createdAt: now,
		});
	}
	console.log("Created 30 votes");

	// Insert some bookmarks
	console.log("Creating bookmarks...");
	for (let i = 0; i < 5; i++) {
		const postId = postIds[i % postIds.length];
		const userId = userIds[i % userIds.length];
		await db.insert(schema.bookmarks).values({
			id: nanoid(),
			userId,
			targetId: postId,
			targetType: "post",
			createdAt: now,
		});
	}
	console.log("Created 5 bookmarks");

	console.log("Seeding complete!");
}

seed()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});