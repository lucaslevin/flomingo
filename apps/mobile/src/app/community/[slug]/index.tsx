import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { PostList } from "@/components/post/post-list";
import { useCommunity } from "@/hooks/use-community.hook";
import { usePosts } from "@/hooks/use-posts.hook";
import { CreateFab } from "@/components/ui/create-fab";

export default function CommunityDetail() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const { community, isLoading: communityLoading } = useCommunity(slug);
	const { posts, isLoading, isValidating, hasMore, setSize, mutate } = usePosts(slug);

	if (communityLoading || !community) {
		return (
			<View className="flex-1 justify-center items-center bg-background">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<ScrollView contentInsetAdjustmentBehavior="automatic">
				<View className="p-4 gap-4">
					<View className="bg-content1 rounded-lg p-4 gap-2" style={{ borderCurve: "continuous" }}>
						<Text className="text-xl font-semibold">c/{community.slug}</Text>
						{community.description && <Text className="text-sm text-foreground-500">{community.description}</Text>}
					</View>

					<PostList
						posts={posts as Parameters<typeof PostList>[0]["posts"]}
						isLoading={isLoading}
						isValidating={isValidating}
						hasMore={hasMore}
						onLoadMore={() => setSize((s) => s + 1)}
						onRefresh={() => mutate()}
					/>
				</View>
			</ScrollView>
			<CreateFab />
		</View>
	);
}
