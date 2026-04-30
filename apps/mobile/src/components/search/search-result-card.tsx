import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import type { SearchResultItem } from "@/types/api";

interface SearchResultCardProps {
	result: SearchResultItem;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
	const timeAgo = formatTimeAgo(result.createdAt);

	if (result.type === "comment") {
		return (
			<View className="bg-content1 rounded-lg p-3 gap-2" style={{ borderCurve: "continuous" }}>
				<View className="flex-row items-center gap-1">
					<Ionicons name="person-circle-outline" size={16} color="#878a8c" />
					<Text className="text-xs text-foreground-500">{result.authorName}</Text>
					<Text className="text-xs text-foreground-400">•</Text>
					<Text className="text-xs text-foreground-400">{timeAgo}</Text>
				</View>
				<Text className="text-sm leading-relaxed">{result.content}</Text>
			</View>
		);
	}

	return (
		<View className="bg-content1 rounded-lg p-3 gap-2" style={{ borderCurve: "continuous" }}>
			<View className="flex-row items-center gap-1">
				<Text className="text-xs text-foreground-500">c/{result.communitySlug}</Text>
				<Text className="text-xs text-foreground-400">•</Text>
				<Text className="text-xs text-foreground-400">Posted by {result.authorName}</Text>
				<Text className="text-xs text-foreground-400">•</Text>
				<Text className="text-xs text-foreground-400">{timeAgo}</Text>
			</View>
			<Text className="text-base font-medium leading-tight">{result.title}</Text>
			<Text className="text-sm text-foreground-500 line-clamp-2">{result.content}</Text>
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
