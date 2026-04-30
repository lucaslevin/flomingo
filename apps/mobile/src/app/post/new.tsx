import { detectMediaInContent } from "@flomingo/utils/opengraph";
import { router } from "expo-router";
import { Button, Input, Label, TextArea } from "heroui-native";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/lib/orpc-client";

export default function CreatePost() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [communityId, setCommunityId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { data } = authClient.useSession();
	const session = data?.session;

	const handleSubmit = async () => {
		if (!session) {
			router.push("/sign-in");
			return;
		}

		if (!title.trim() || !content.trim()) {
			Alert.alert("Error", "Title and content are required.");
			return;
		}

		setIsSubmitting(true);
		try {
			const { id: postId } = await orpcClient.post.create({
				title: title.trim(),
				content: content.trim(),
				communityId: communityId.trim(),
			});

			const detectedMedia = detectMediaInContent(content);
			for (const [index, media] of detectedMedia.entries()) {
				if (media.type === "link") {
					await orpcClient.attachment.create({
						postId,
						type: "link",
						url: media.url,
						order: index,
					});
				}
			}

			router.back();
		} catch (err) {
			Alert.alert("Error", "Failed to create post. Please try again.");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic" className="bg-background">
			<View className="p-4 gap-4">
				<Text className="text-xl font-semibold">Create Post</Text>

				<View className="gap-2">
					<Label>Community ID (optional)</Label>
					<Input value={communityId} onChangeText={setCommunityId} placeholder="Community ID" autoCapitalize="none" />
				</View>

				<View className="gap-2">
					<Label>Title</Label>
					<Input value={title} onChangeText={setTitle} placeholder="Post title" autoCapitalize="sentences" />
				</View>

				<View className="gap-2">
					<Label>Content</Label>
					<TextArea value={content} onChangeText={setContent} placeholder="What's on your mind?" numberOfLines={8} className="min-h-32" />
				</View>

				<Button onPress={handleSubmit} variant="primary" className="mt-2" isDisabled={!title.trim() || !content.trim() || isSubmitting}>
					Post
				</Button>
			</View>
		</ScrollView>
	);
}
