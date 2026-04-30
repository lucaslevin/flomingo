import type { LegendListRenderItemProps } from "@legendapp/list";
import { LegendList } from "@legendapp/list";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Separator, Spinner, TextArea, useThemeColor } from "heroui-native";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { CommentCard } from "@/components/comment/comment-card";
import { MediaAttachment } from "@/components/post/media-attachment";
import { VoteButton } from "@/components/post/vote-button";
import { Avatar } from "@/components/ui/avatar";
import { useComments } from "@/hooks/use-comments";
import { usePost } from "@/hooks/use-post";
import { authClient } from "@/lib/auth-client";
import { formatTimeAgo } from "@/lib/format";
import { orpcClient } from "@/lib/orpc-client";

function PostHeader({ post, commentCount }: { post: NonNullable<ReturnType<typeof usePost>["post"]>; commentCount: number }) {
	const timeAgo = formatTimeAgo(post.createdAt);

	return (
		<View className="px-4 pt-4 pb-2">
			<Text className="text-[10px] text-muted mb-3">
				c/{post.communitySlug} · {timeAgo}
			</Text>
			<View className="flex-row items-center gap-3 mb-3">
				<Avatar name={post.authorName} size={32} />
				<Text className="text-base text-foreground font-medium">{post.authorName}</Text>
			</View>
			<Text className="text-2xl font-bold text-foreground leading-tight">{post.title}</Text>
			<Text className="text-base text-foreground leading-relaxed mt-3">{post.content}</Text>

			{post.attachments && post.attachments.length > 0 && (
				<View className="mt-4">
					<MediaAttachment attachments={post.attachments} />
				</View>
			)}

			<View className="flex-row items-center justify-between mt-6 pb-4">
				<Text className="text-sm text-muted">{commentCount} comments</Text>
				<VoteButton postId={post.id} score={post.score} userVote={post.userVote ?? 0} />
			</View>
		</View>
	);
}

function CommentInput({ onSubmit, isSubmitting }: { onSubmit: (text: string) => void; isSubmitting: boolean }) {
	const [text, setText] = useState("");
	const accentForeground = useThemeColor("accent-foreground");

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="px-4 pb-4">
			<View className="bg-surface border-t border-border p-3">
				<TextArea value={text} onChangeText={setText} placeholder="Add a comment..." numberOfLines={3} className="min-h-12 bg-surface-secondary mb-2" />
				<View className="flex-row justify-end">
					<Button
						size="sm"
						variant="primary"
						onPress={() => {
							if (text.trim()) {
								onSubmit(text.trim());
								setText("");
							}
						}}
						isDisabled={!text.trim() || isSubmitting}
					>
						{isSubmitting ? <Spinner color={accentForeground} size="sm" /> : <Button.Label>Post</Button.Label>}
					</Button>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

export default function PostDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { post, isLoading: postLoading, mutate: mutatePost } = usePost(id);
	const { comments, isLoading: commentsLoading, isValidating, hasMore, setSize, mutate: mutateComments } = useComments(id);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { data } = authClient.useSession();

	const handleCommentSubmit = async (content: string) => {
		if (!data?.session) {
			router.push("/sign-in");
			return;
		}

		if (!content.trim() || !id) return;

		setIsSubmitting(true);
		try {
			await orpcClient.comment.create({ postId: id, parentCommentId: null, content: content.trim() });
			mutateComments();
			mutatePost();
		} catch {
			Alert.alert("Error", "Failed to post comment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (postLoading || !post) {
		return (
			<View className="flex-1 justify-center items-center bg-background">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<LegendList
				ListHeaderComponent={
					<View>
						<PostHeader post={post} commentCount={comments.length} />
						<Separator className="mx-4 mb-3" />
					</View>
				}
				data={comments}
				keyExtractor={(item) => item.id}
				renderItem={({ item, index }: LegendListRenderItemProps<(typeof comments)[0]>) => (
					<View className={index % 2 === 0 ? "bg-background" : "bg-surface"}>
						<CommentCard comment={item} />
					</View>
				)}
				ItemSeparatorComponent={() => <View className="h-2" />}
				recycleItems={true}
				onEndReached={hasMore ? () => setSize((s) => s + 1) : undefined}
				onEndReachedThreshold={0.5}
				contentInsetAdjustmentBehavior="automatic"
				ListEmptyComponent={commentsLoading ? <ActivityIndicator size="small" /> : <Text className="text-sm text-muted text-center py-8">No comments yet</Text>}
				ListFooterComponent={
					isValidating && comments.length > 0 ? (
						<View className="py-4">
							<ActivityIndicator size="small" />
						</View>
					) : null
				}
			/>

			{data?.session ? (
				<CommentInput onSubmit={handleCommentSubmit} isSubmitting={isSubmitting} />
			) : (
				<View className="px-4 pt-4 pb-6 border-t border-border">
					<Button onPress={() => router.push("/sign-in")} className="w-full py-2.5" variant="primary">
						<Button.Label>Sign in to comment</Button.Label>
					</Button>
				</View>
			)}
		</View>
	);
}
