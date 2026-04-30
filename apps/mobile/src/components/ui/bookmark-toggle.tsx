import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import { authClient } from "@/lib/auth-client";

interface BookmarkToggleProps {
	targetId: string;
	targetType: "post" | "comment";
	count: number;
}

export function BookmarkToggle({ targetId: _targetId, targetType: _targetType, count }: BookmarkToggleProps) {
	const { data } = authClient.useSession();
	const session = data?.session;

	const handlePress = () => {
		if (!session) {
			router.push("/auth-prompt");
			return;
		}
	};

	return (
		<Pressable onPress={handlePress} className="flex-row items-center gap-1">
			<Ionicons name="bookmark-outline" size={16} color="#878a8c" />
			<Text className="text-xs text-foreground-500">{count}</Text>
		</Pressable>
	);
}
