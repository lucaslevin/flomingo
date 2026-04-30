import { useState } from "react";
import { ScrollView, View, Text, Alert } from "react-native";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/lib/orpc-client";
import { Button, Input, Label, TextArea } from "heroui-native";

export default function CreatePost() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [communityId, setCommunityId] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { data } = authClient.useSession();
	const session = data?.session;

	const handleSubmit = async () => {
		if (!session) {
			router.push("/auth-prompt");
			return;
		}

		if (!title.trim() || !content.trim()) {
			Alert.alert("Error", "Title and content are required.");
			return;
		}

		setIsLoading(true);
		try {
			await orpcClient.post.create({
				title: title.trim(),
				content: content.trim(),
				communityId: communityId.trim(),
			});
			router.back();
		} catch {
			Alert.alert("Error", "Failed to create post. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic" className="bg-background">
			<View className="p-4 gap-4">
				<Text className="text-xl font-semibold">Create Post</Text>

				<View className="gap-2">
					<Label>Community ID (optional)</Label>
					<Input
						value={communityId}
						onChangeText={setCommunityId}
						placeholder="Community ID"
						autoCapitalize="none"
					/>
				</View>

				<View className="gap-2">
					<Label>Title</Label>
					<Input
						value={title}
						onChangeText={setTitle}
						placeholder="Post title"
						autoCapitalize="sentences"
					/>
				</View>

				<View className="gap-2">
					<Label>Content</Label>
					<TextArea
						value={content}
						onChangeText={setContent}
						placeholder="What's on your mind?"
						numberOfLines={8}
						className="min-h-32"
					/>
				</View>

				<Button
					onPress={handleSubmit}
					isLoading={isLoading}
					variant="primary"
					className="mt-2"
					isDisabled={!title.trim() || !content.trim()}
				>
					Post
				</Button>
			</View>
		</ScrollView>
	);
}