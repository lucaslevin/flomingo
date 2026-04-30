import { router } from "expo-router";
import { Button, Input, Label, TextArea } from "heroui-native";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/lib/orpc-client";

export default function CreateCommunity() {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { data } = authClient.useSession();
	const session = data?.session;

	const handleSubmit = async () => {
		if (!session) {
			router.push("/sign-in");
			return;
		}

		if (!name.trim()) {
			Alert.alert("Error", "Community name is required.");
			return;
		}

		setIsLoading(true);
		try {
			const community = await orpcClient.community.create({
				name: name.trim(),
				description: description.trim() || undefined,
			});
			router.back();
			router.push({ pathname: "/community/[slug]", params: { slug: community.slug } });
		} catch {
			Alert.alert("Error", "Failed to create community. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic" className="bg-background">
			<View className="p-4 gap-4">
				<Text className="text-xl font-semibold">Create Community</Text>

				<View className="gap-2">
					<Label>Name</Label>
					<Input value={name} onChangeText={setName} placeholder="Community name" autoCapitalize="none" />
				</View>

				<View className="gap-2">
					<Label>Description (optional)</Label>
					<TextArea value={description} onChangeText={setDescription} placeholder="What is this community about?" numberOfLines={4} className="min-h-24" />
				</View>

				<Button onPress={handleSubmit} isLoading={isLoading} variant="primary" className="mt-2" isDisabled={!name.trim()}>
					Create
				</Button>
			</View>
		</ScrollView>
	);
}
