import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/format";
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
				<Avatar name={bookmark.authorName} size={16} />
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
