import type { LegendListRenderItemProps } from "@legendapp/list";
import { LegendList } from "@legendapp/list";
import { ActivityIndicator, RefreshControl, Text, View } from "react-native";
import { PostCard } from "./post-card";

interface Post {
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
}

interface PostListProps {
	posts: Post[];
	isLoading: boolean;
	isValidating: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
	onRefresh: () => void;
}

export function PostList({ posts, isLoading, isValidating, hasMore, onLoadMore, onRefresh }: PostListProps) {
	if (isLoading && posts.length === 0) {
		return (
			<View className="flex-1 justify-center items-center py-8">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (posts.length === 0) {
		return (
			<View className="flex-1 justify-center items-center py-8">
				<Text className="text-foreground-400">No posts yet</Text>
			</View>
		);
	}

	return (
		<LegendList
			data={posts}
			keyExtractor={(item) => item.id}
			renderItem={({ item }: LegendListRenderItemProps<Post>) => <PostCard post={item} />}
			recycleItems={true}
			maintainVisibleContentPosition
			style={{ paddingVertical: 8 }}
			onEndReached={hasMore ? onLoadMore : undefined}
			onEndReachedThreshold={0.5}
			refreshControl={<RefreshControl refreshing={isValidating && posts.length > 0} onRefresh={onRefresh} />}
			ItemSeparatorComponent={() => <View className="h-2" />}
			ListFooterComponent={
				isValidating && posts.length > 0 ? (
					<View className="py-4">
						<ActivityIndicator size="small" />
					</View>
				) : null
			}
		/>
	);
}
