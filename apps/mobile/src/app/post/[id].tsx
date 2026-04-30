import { useState } from "react";
import { ScrollView, View, Text, ActivityIndicator, Pressable, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, router } from "expo-router";
import { usePost } from "@/hooks/use-post.hook";
import { useComments } from "@/hooks/use-comments.hook";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/lib/orpc-client";
import { VoteButton } from "@/components/post/vote-button";
import { CommentCard } from "@/components/comment/comment-card";
import { Button, TextArea } from "heroui-native";

export default function PostDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { post, isLoading: postLoading, mutate: mutatePost } = usePost(id);
	const { comments, isLoading: commentsLoading, hasMore, setSize, mutate: mutateComments } = useComments(id);
	const [commentText, setCommentText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showCommentInput, setShowCommentInput] = useState(false);

	const { data } = authClient.useSession();
	const session = data?.session;

	const handleCommentSubmit = async () => {
		if (!session) {
			router.push("/auth-prompt");
			return;
		}

		if (!commentText.trim() || !id) return;

		setIsSubmitting(true);
		try {
			await orpcClient.comment.create({
				postId: id,
				parentCommentId: null,
				content: commentText.trim(),
			});
			setCommentText("");
			setShowCommentInput(false);
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
		<ScrollView contentInsetAdjustmentBehavior="automatic">
			<View className="p-4 bg-background gap-4">
				<View className="bg-content1 rounded-lg p-4 gap-3" style={{ borderCurve: "continuous" }}>
					<View className="flex-row items-center gap-2">
						<Pressable>
							<View className="flex-row items-center gap-1">
								<Ionicons name="person-circle-outline" size={20} color="#878a8c" />
								<Text className="text-sm text-foreground-500">c/{post.communitySlug}</Text>
							</View>
						</Pressable>
						<Text className="text-foreground-400">•</Text>
						<Text className="text-sm text-foreground-400">Posted by {post.authorName}</Text>
					</View>

					<Text className="text-xl font-semibold">{post.title}</Text>
					<Text className="text-base leading-relaxed">{post.content}</Text>

					<View className="flex-row items-center gap-4 pt-2">
						<VoteButton postId={post.id} score={post.score} userVote={post.userVote} />
						<View className="flex-row items-center gap-1">
							<Ionicons name="chatbubble-outline" size={20} color="#878a8c" />
							<Text className="text-sm text-foreground-500">{comments.length} comments</Text>
						</View>
						<Pressable className="flex-row items-center gap-1">
							<Ionicons name="bookmark-outline" size={20} color="#878a8c" />
							<Text className="text-sm text-foreground-500">{post.bookmarkCount}</Text>
						</Pressable>
					</View>
				</View>

				<View className="bg-content1 rounded-lg p-4" style={{ borderCurve: "continuous" }}>
					{showCommentInput ? (
						<View className="gap-3">
							<TextArea
								value={commentText}
								onChangeText={setCommentText}
								placeholder="Write a comment..."
								numberOfLines={4}
								className="min-h-24"
							/>
							<View className="flex-row gap-2 justify-end">
								<Button variant="light" onPress={() => setShowCommentInput(false)}>
									Cancel
								</Button>
								<Button
									variant="primary"
									isLoading={isSubmitting}
									onPress={handleCommentSubmit}
									isDisabled={!commentText.trim()}
								>
									Post
								</Button>
							</View>
						</View>
					) : (
						<Pressable
							onPress={() => {
								if (!session) {
									router.push("/auth-prompt");
								} else {
									setShowCommentInput(true);
								}
							}}
							className="bg-content2 rounded-lg p-3"
							style={{ borderCurve: "continuous" }}
						>
							<Text className="text-foreground-500">Add a comment</Text>
						</Pressable>
					)}

					<Text className="text-base font-semibold mt-4 mb-3">Comments</Text>
					{commentsLoading && comments.length === 0 ? (
						<ActivityIndicator size="small" />
					) : (
						<View className="gap-2">
							{comments.map((comment) => (
								<CommentCard key={comment.id} comment={comment} />
							))}
							{comments.length === 0 && !isLoading && (
								<Text className="text-foreground-400 text-center py-4">No comments yet</Text>
							)}
						</View>
					)}
					{hasMore && (
						<Text className="text-foreground-500 text-center py-2" onPress={() => setSize((s) => s + 1)}>
							Load more comments
						</Text>
					)}
				</View>
			</View>
		</ScrollView>
	);
}