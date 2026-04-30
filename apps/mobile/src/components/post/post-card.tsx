import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { VoteButton } from "./vote-button";

interface PostCardProps {
	post: {
		id: string;
		title: string;
		authorId: string;
		authorName: string;
		communityId: string;
		communitySlug: string;
		createdAt: number;
		score: number;
		commentCount: number;
		bookmarkCount: number;
		userVote?: number;
	};
}

export function PostCard({ post }: PostCardProps) {
	const timeAgo = formatTimeAgo(post.createdAt);

	return (
		<View>
			<View className="px-3 py-3">
				<Text className="text-xs text-foreground-500">
					{post.authorName} · c/{post.communitySlug} · {timeAgo}
				</Text>

				<Link href={{ pathname: "/post/[id]", params: { id: post.id } }}>
					<Text className="text-sm font-medium leading-snug mt-1">{post.title}</Text>
				</Link>

				<View className="flex-row items-center gap-2 mt-2">
					<VoteButton postId={post.id} score={post.score} userVote={post.userVote ?? 0} />
					<Link href={{ pathname: "/post/[id]", params: { id: post.id } }}>
						<View className="flex-row items-center gap-1">
							<Ionicons name="chatbubble-outline" size={18} color="#878a8c" />
							<Text className="text-xs text-foreground-500">{post.commentCount}</Text>
						</View>
					</Link>
					<Pressable>
						<View className="flex-row items-center gap-1">
							<Ionicons name="bookmark-outline" size={18} color="#878a8c" />
							<Text className="text-xs text-foreground-500">{post.bookmarkCount}</Text>
						</View>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

function formatTimeAgo(timestamp: number): string {
	const seconds = Math.floor(Date.now() / 1000 - timestamp);
	const intervals = [
		{ label: "y", seconds: 31536000 },
		{ label: "mo", seconds: 2592000 },
		{ label: "w", seconds: 604800 },
		{ label: "d", seconds: 86400 },
		{ label: "h", seconds: 3600 },
		{ label: "m", seconds: 60 },
	];
	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds);
		if (count >= 1) return `${count}${interval.label} ago`;
	}
	return "just now";
}
