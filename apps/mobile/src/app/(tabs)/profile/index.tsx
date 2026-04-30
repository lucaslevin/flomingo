import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Button } from "heroui-native";
import { ScrollView, Text, View } from "react-native";
import { BookmarkCard } from "@/components/bookmark/bookmark-card";
import { useBookmarks } from "@/hooks/use-bookmarks.hook";
import { authClient } from "@/lib/auth-client";

export default function ProfileScreen() {
	const { data } = authClient.useSession();

	const { bookmarks, isLoading, hasMore, setSize } = useBookmarks();

	if (!data?.session) {
		return (
			<ScrollView contentInsetAdjustmentBehavior="automatic">
				<View className="p-4 bg-background gap-4">
					<View className="bg-content1 rounded-lg p-4 items-center" style={{ borderCurve: "continuous" }}>
						<Ionicons name="person-circle" size={64} color="#878a8c" />
						<Text className="text-lg font-semibold mt-2">Guest User</Text>
						<Text className="text-sm text-foreground-400">Sign in to see your profile</Text>
						<Button onPress={() => router.push("/sign-in")} variant="primary" className="mt-3">
							Sign In
						</Button>
					</View>
				</View>
			</ScrollView>
		);
	}

	const user = data?.user;

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic">
			<View className="p-4 bg-background gap-4">
				<View className="bg-content1 rounded-lg p-4 items-center" style={{ borderCurve: "continuous" }}>
					{user.image ? <Image source={user.image} className="w-16 h-16" /> : <Ionicons name="person-circle" size={64} color="#878a8c" />}
					<Text className="text-lg font-semibold mt-2">{user.name || user.email}</Text>
					<Text className="text-sm text-foreground-400">{user.email}</Text>
				</View>

				<View className="bg-content1 rounded-lg p-4" style={{ borderCurve: "continuous" }}>
					<Text className="text-base font-semibold mb-3">Bookmarks</Text>
					<View className="gap-2">
						{bookmarks.map((bookmark) => (
							<BookmarkCard key={bookmark.id} bookmark={bookmark} />
						))}
					</View>
					{bookmarks.length === 0 && !isLoading && <Text className="text-foreground-400 text-center py-4">No bookmarks yet</Text>}
					{hasMore && (
						<Text className="text-foreground-500 text-center py-2" onPress={() => setSize((s) => s + 1)}>
							Load more
						</Text>
					)}
				</View>
			</View>
		</ScrollView>
	);
}