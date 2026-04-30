import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import type { BookmarkItem } from "@/types/api";

interface BookmarkCardProps {
	bookmark: BookmarkItem;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
	const timeAgo = formatTimeAgo(bookmark.bookmarkedAt);

	if (bookmark.type === "comment") {
		return (
			<View className="bg-content2 rounded-lg p-3 gap-2" style={{ borderCurve: "continuous" }}>
				<View className="flex-row items-center gap-1">
					<Ionicons name="chatbubble-outline" size={16} color="#878a8c" />
					<Text className="text-xs text-foreground-500">Comment</Text>
					<Text className="text-xs text-foreground-400">•</Text>
					<Text className="text-xs text-foreground-400">{timeAgo}</Text>
				</View>
				<Text className="text-sm leading-relaxed">{bookmark.content}</Text>
			</View>
		);
	}

	return (
		<View className="bg-content2 rounded-lg p-3 gap-2" style={{ borderCurve: "continuous" }}>
			<View className="flex-row items-center gap-1">
				<Ionicons name="person-circle-outline" size={16} color="#878a8c" />
				<Text className="text-xs text-foreground-500">{bookmark.authorName}</Text>
				<Text className="text-xs text-foreground-400">•</Text>
				<Text className="text-xs text-foreground-400">c/{bookmark.communitySlug}</Text>
				<Text className="text-xs text-foreground-400">•</Text>
				<Text className="text-xs text-foreground-400">{timeAgo}</Text>
			</View>
			<Text className="text-sm font-medium">{bookmark.title}</Text>
			<Text className="text-xs text-foreground-500 line-clamp-2">{bookmark.content}</Text>
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
