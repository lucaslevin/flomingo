import { Text, View } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/format";
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
					<Avatar name={result.authorName} size={16} />
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
