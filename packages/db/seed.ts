import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { nanoid } from "nanoid";
import { generatePostEmbedding } from "../ai/embedding";
import * as schema from "./schema";

const client = new SQL(process.env.DATABASE_URL as string);
const db = drizzle({ client, schema });

const communities = [
	{ name: "General", slug: "general", description: "General discussions" },
	{ name: "Tech", slug: "tech", description: "Technology discussions" },
	{ name: "Gaming", slug: "gaming", description: "Video games" },
	{ name: "Movies", slug: "movies", description: "Film discussions" },
	{ name: "Music", slug: "music", description: "Music discussions" },
	{ name: "Books", slug: "books", description: "Book discussions" },
	{ name: "Fitness", slug: "fitness", description: "Health and fitness" },
	{ name: "Food", slug: "food", description: "Cooking and food" },
	{ name: "Travel", slug: "travel", description: "Travel experiences" },
	{ name: "Photography", slug: "photography", description: "Photo tips and gear" },
];

const users = [
	{ name: "Alice", email: "alice@example.com" },
	{ name: "Bob", email: "bob@example.com" },
	{ name: "Carol", email: "carol@example.com" },
	{ name: "David", email: "david@example.com" },
	{ name: "Emma", email: "emma@example.com" },
	{ name: "Frank", email: "frank@example.com" },
	{ name: "Grace", email: "grace@example.com" },
	{ name: "Henry", email: "henry@example.com" },
];

const postsData: Array<{
	title: string;
	content: string;
	images?: string[];
	link?: { url: string; title: string; description: string; image?: string };
}> = [
	{
		title: "My new gaming setup",
		content: "Just finished my battlestation build. Here's what I ended up with after months of research!",
		images: [
			"https://picsum.photos/seed/setup1/800/600",
			"https://picsum.photos/seed/setup2/800/600",
			"https://picsum.photos/seed/setup3/800/600",
		],
	},
	{
		title: "Tokyo and Osaka itinerary",
		content: "Planning my Japan trip for October. Flying into Tokyo, spending 4 days there, then bullet train to Osaka for 3 days.",
		link: {
			url: "https://www.japan-guide.com/e/e2158.html",
			title: "Japan Travel Guide - Tokyo",
			description: "Complete travel guide for visiting Tokyo, Japan",
			image: "https://picsum.photos/seed/japan/600/400",
		},
	},
	{
		title: "Elden Ring is amazing",
		content: "Just finished Malenia after countless attempts. What an incredible fight!",
		images: ["https://picsum.photos/seed/eldenring/800/600"],
	},
	{
		title: "Best pizza dough recipe",
		content: "After years of perfecting my dough, here's my go-to recipe for crispy yet chewy crust",
		images: [
			"https://picsum.photos/seed/pizza1/800/600",
			"https://picsum.photos/seed/pizza2/800/600",
		],
		link: {
			url: "https://www.seriouseats.com/pizza-dough-recipe",
			title: "Perfect Pizza Dough Recipe",
			description: "The best pizza dough for home bakers",
			image: "https://picsum.photos/seed/pizza3/600/400",
		},
	},
	{
		title: "Golden hour photography",
		content: "Spent the whole evening chasing the light. These turned out beautiful",
		images: [
			"https://picsum.photos/seed/photo1/800/600",
			"https://picsum.photos/seed/photo2/800/600",
			"https://picsum.photos/seed/photo3/800/600",
			"https://picsum.photos/seed/photo4/800/600",
		],
	},
	{
		title: "Gaming PC build guide",
		content: "Finally upgraded after 5 years. RTX 4080, Ryzen 9, 64GB RAM. Here's how it performs",
		images: [
			"https://picsum.photos/seed/pc1/800/600",
			"https://picsum.photos/seed/pc2/800/600",
		],
		link: {
			url: "https://pcpartpicker.com",
			title: "PCPartPicker - Build Guides",
			description: "Find the best PC builds and compare prices",
			image: "https://picsum.photos/seed/pc3/600/400",
		},
	},
	{
		title: "Sourdough first bake",
		content: "My 7-day starter finally ready. First loaf came out decent but needs more practice",
		images: [
			"https://picsum.photos/seed/bread1/800/600",
			"https://picsum.photos/seed/bread2/800/600",
		],
	},
	{
		title: "Barcelona trip",
		content: "Heading to Barcelona next week! Need recommendations for tapas and hidden gems",
		link: {
			url: "https://www.lonelyplanet.com/spain/barcelona",
			title: "Barcelona Travel Guide",
			description: "Best things to do, places to eat, and hidden gems in Barcelona",
			image: "https://picsum.photos/seed/barcelona/600/400",
		},
	},
	{
		title: "Home gym progress",
		content: "6 months of consistent training. Down 20lbs, up 50lbs on deadlift",
		images: [
			"https://picsum.photos/seed/gym1/800/600",
			"https://picsum.photos/seed/gym2/800/600",
		],
	},
	{
		title: "Dune 2 was incredible",
		content: "Denis Villeneuve absolutely nailed it. The visuals were out of this world",
		images: ["https://picsum.photos/seed/dune/800/600"],
	},
	{
		title: "London hidden gems",
		content: "Been living here 3 years, here are my favorite spots that tourists usually miss",
		images: [
			"https://picsum.photos/seed/london1/800/600",
			"https://picsum.photos/seed/london2/800/600",
		],
		link: {
			url: "https://www.timeout.com/london/things-to-do/best-hidden-gems-london",
			title: "Hidden Gems in London",
			description: "The best kept secrets and hidden gems in London",
			image: "https://picsum.photos/seed/london3/600/400",
		},
	},
	{
		title: "New board game collection",
		content: "Finally got a proper shelf for my board games. Here's the collection so far",
		images: [
			"https://picsum.photos/seed/boardgame1/800/600",
			"https://picsum.photos/seed/boardgame2/800/600",
			"https://picsum.photos/seed/boardgame3/800/600",
		],
	},
	{
		title: "Morning coffee setup",
		content: "Upgraded from French press to this pour-over setup. Game changer for daily coffee",
		images: ["https://picsum.photos/seed/coffee/800/600"],
	},
	{
		title: "New camera day",
		content: "Finally upgraded from my old Nikon to a Sony A7IV. First impressions",
		images: [
			"https://picsum.photos/seed/camera1/800/600",
			"https://picsum.photos/seed/camera2/800/600",
		],
		link: {
			url: "https://www.sony.com/INTERFACE/CAMERA/ILCE-7M4",
			title: "Sony A7IV Product Page",
			description: "The ultimate hybrid camera for photo and video",
			image: "https://picsum.photos/seed/camera3/600/400",
		},
	},
	{
		title: "Project Hail Mary review",
		content: "Just finished Andy Weir's latest. Couldn't put it down!",
		link: {
			url: "https://www.goodreads.com/book/show/54493401-project-hail-mary",
			title: "Project Hail Mary - Goodreads",
			description: "A lone astronaut must save the earth from disaster",
			image: "https://picsum.photos/seed/book/600/400",
		},
	},
	{
		title: "Street photography",
		content: "Captured some interesting moments downtown today",
		images: [
			"https://picsum.photos/seed/street1/800/600",
			"https://picsum.photos/seed/street2/800/600",
			"https://picsum.photos/seed/street3/800/600",
			"https://picsum.photos/seed/street4/800/600",
			"https://picsum.photos/seed/street5/800/600",
		],
	},
	{
		title: "AI coding assistant comparison",
		content: "Been using Copilot, Claude, and Gemini Pro for the past month. Here's my breakdown",
		link: {
			url: "https://github.com/features/copilot",
			title: "GitHub Copilot",
			description: "AI pair programmer that helps you write code faster",
			image: "https://picsum.photos/seed/ai/600/400",
		},
	},
	{
		title: "Air fryer chicken wings",
		content: "20 minutes, crispy skin, no deep frying needed. Recipe in comments",
		images: [
			"https://picsum.photos/seed/wings1/800/600",
			"https://picsum.photos/seed/wings2/800/600",
		],
	},
	{
		title: "Marathon training week 8",
		content: "Hit my longest run yet: 15 miles! Feeling strong for NYC",
		images: ["https://picsum.photos/seed/running/800/600"],
	},
	{
		title: "Minimalist desk setup",
		content: "Cleaned up my desk and went full minimalist. So much more productive now",
		images: [
			"https://picsum.photos/seed/desk1/800/600",
			"https://picsum.photos/seed/desk2/800/600",
		],
	},
];

const topLevelComments = [
	"This is exactly what I was looking for! Thanks for sharing.",
	"I've been thinking about this for a while, great to see it discussed.",
	"Completely agree with this. Been in a similar situation.",
	"Interesting perspective. I hadn't considered it from that angle.",
	"This deserves way more attention.",
	"Nice write-up! Very helpful.",
	"I've tried this before and can confirm it works great.",
	"Not sure I fully agree, but respect the effort put into this.",
	"This is the kind of content we need more of.",
	"Bookmarking this for later reference.",
	"Hadn't heard of this before, thanks for bringing it up.",
	"This is why I love this community.",
	"Would love to see a follow-up on this.",
	"The attention to detail here is impressive.",
	"This hits different. Thank you!",
];

const secondLevelReplies = [
	"Yeah exactly!",
	"I second that.",
	"Could not agree more.",
	"Same here!",
	"So true.",
	"Great point.",
	"This.",
	"Exactly my thoughts.",
	"Well said.",
	"Preach!",
	"Absolutely.",
	"100% agree.",
	"Nailed it.",
	"Couldn't have said it better.",
	"This is gold.",
];

const thirdLevelReplies = [
	"Haha same",
	"Exactly!",
	"Ha! True that.",
	"Seriously though",
	"This x100",
	"So me",
	"Pretty much",
	"Yesss",
	"Absolutely",
	" facts",
];

async function seed() {
	console.log("Seeding database...");
	const now = new Date();
	const oneHour = 60 * 60 * 1000;
	const oneDay = 24 * oneHour;

	console.log("Creating communities...");
	const communityIds: string[] = [];
	for (const community of communities) {
		const id = nanoid();
		communityIds.push(id);
		await db.insert(schema.communities).values({
			id,
			name: community.name,
			slug: community.slug,
			description: community.description,
			createdAt: new Date(now.getTime() - 60 * oneDay),
			updatedAt: new Date(now.getTime() - 60 * oneDay),
		}).onConflictDoNothing();
	}
	console.log(`Created ${communities.length} communities`);

	console.log("Creating users...");
	const userIds: string[] = [];
	for (const user of users) {
		const id = nanoid();
		userIds.push(id);
		await db.insert(schema.users).values({
			id,
			name: user.name,
			email: user.email,
			createdAt: new Date(now.getTime() - 45 * oneDay),
			updatedAt: new Date(now.getTime() - 45 * oneDay),
		}).onConflictDoNothing();
	}
	console.log(`Created ${users.length} users`);

	console.log("Creating posts with attachments...");
	const postIds: string[] = [];
	for (let i = 0; i < postsData.length; i++) {
		const post = postsData[i];
		const hoursAgo = Math.floor(Math.random() * 72);
		const id = nanoid();
		postIds.push(id);

		console.log(`  Creating post: ${post.title}`);
		const embedding = await generatePostEmbedding(post.title, post.content);

		await db.insert(schema.posts).values({
			id,
			title: post.title,
			content: post.content,
			authorId: userIds[i % userIds.length],
			communityId: communityIds[i % communityIds.length],
			embedding,
			createdAt: new Date(now.getTime() - hoursAgo * oneHour),
			updatedAt: new Date(now.getTime() - hoursAgo * oneHour),
		});

		let order = 0;
		if (post.images) {
			for (const imageUrl of post.images) {
				await db.insert(schema.attachments).values({
					id: nanoid(),
					postId: id,
					type: imageUrl.includes(".gif") ? "gif" : "image",
					url: imageUrl,
					thumbnailUrl: imageUrl,
					order: order++,
					createdAt: new Date(now.getTime() - hoursAgo * oneHour),
				});
			}
		}

		if (post.link) {
			await db.insert(schema.attachments).values({
				id: nanoid(),
				postId: id,
				type: "link",
				url: post.link.url,
				order: order,
				ogTitle: post.link.title,
				ogDescription: post.link.description,
				ogImageUrl: post.link.image,
				createdAt: new Date(now.getTime() - hoursAgo * oneHour),
			});
		}
	}
	console.log(`Created ${postsData.length} posts with attachments`);

	console.log("Creating nested comments...");
	let commentCount = 0;
	const allCommentIds: string[] = [];

	for (const postId of postIds) {
		const numTopLevel = Math.floor(Math.random() * 4) + 3;
		const topLevelIds: string[] = [];

		for (let c = 0; c < numTopLevel; c++) {
			const id = nanoid();
			topLevelIds.push(id);
			allCommentIds.push(id);
			await db.insert(schema.comments).values({
				id,
				content: topLevelComments[Math.floor(Math.random() * topLevelComments.length)],
				authorId: userIds[Math.floor(Math.random() * userIds.length)],
				postId,
				parentCommentId: null,
				depth: "0",
				createdAt: new Date(now.getTime() - Math.random() * 48 * oneHour),
			});
			commentCount++;
		}

		for (const parentId of topLevelIds) {
			if (Math.random() > 0.6) {
				const numSecondLevel = Math.floor(Math.random() * 2) + 1;
				const secondLevelIds: string[] = [];

				for (let s = 0; s < numSecondLevel; s++) {
					const id = nanoid();
					secondLevelIds.push(id);
					allCommentIds.push(id);
					await db.insert(schema.comments).values({
						id,
						content: secondLevelReplies[Math.floor(Math.random() * secondLevelReplies.length)],
						authorId: userIds[Math.floor(Math.random() * userIds.length)],
						postId,
						parentCommentId: parentId,
						depth: "1",
						createdAt: new Date(now.getTime() - Math.random() * 24 * oneHour),
					});
					commentCount++;
				}

				for (const parent2Id of secondLevelIds) {
					if (Math.random() > 0.7) {
						const id = nanoid();
						allCommentIds.push(id);
						await db.insert(schema.comments).values({
							id,
							content: thirdLevelReplies[Math.floor(Math.random() * thirdLevelReplies.length)],
							authorId: userIds[Math.floor(Math.random() * userIds.length)],
							postId,
							parentCommentId: parent2Id,
							depth: "2",
							createdAt: new Date(now.getTime() - Math.random() * 12 * oneHour),
						});
						commentCount++;
					}
				}
			}
		}
	}
	console.log(`Created ${commentCount} comments`);

	console.log("Creating votes...");
	let voteCount = 0;
	for (const postId of postIds) {
		for (let v = 0; v < 5; v++) {
			await db.insert(schema.votes).values({
				id: nanoid(),
				userId: userIds[Math.floor(Math.random() * userIds.length)],
				targetId: postId,
				targetType: "post",
				value: Math.random() > 0.25 ? 1 : -1,
				createdAt: new Date(now.getTime() - Math.random() * 24 * oneHour),
			}).onConflictDoNothing();
			voteCount++;
		}
	}
	console.log(`Created ${voteCount} votes`);

	console.log("Creating community follows...");
	let cfCount = 0;
	for (const userId of userIds) {
		for (let c = 0; c < 4; c++) {
			await db.insert(schema.communityFollowers).values({
				id: nanoid(),
				userId,
				communityId: communityIds[Math.floor(Math.random() * communityIds.length)],
				createdAt: new Date(now.getTime() - Math.random() * 20 * oneDay),
			}).onConflictDoNothing();
			cfCount++;
		}
	}
	console.log(`Created ${cfCount} community follows`);

	console.log("Creating user follows...");
	let ufCount = 0;
	for (let i = 0; i < userIds.length; i++) {
		for (let f = 1; f < 3; f++) {
			await db.insert(schema.userFollows).values({
				id: nanoid(),
				followerId: userIds[i],
				followingId: userIds[(i + f) % userIds.length],
				createdAt: new Date(now.getTime() - Math.random() * 10 * oneDay),
			}).onConflictDoNothing();
			ufCount++;
		}
	}
	console.log(`Created ${ufCount} user follows`);

	console.log("Seeding complete!");
}

seed()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});