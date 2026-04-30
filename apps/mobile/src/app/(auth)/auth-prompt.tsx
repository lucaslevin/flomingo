import { router } from "expo-router";
import { Button } from "heroui-native";
import { Pressable, Text, View } from "react-native";

export default function AuthPrompt() {
	return (
		<View className="flex-1 justify-center items-center p-6 bg-background">
			<View className="bg-content1 rounded-lg p-6 gap-4 w-full" style={{ borderCurve: "continuous" }}>
				<Text className="text-lg font-semibold text-center">Sign in required</Text>
				<Text className="text-foreground-500 text-center">You need to be signed in to perform this action.</Text>

				<Button onPress={() => router.push("/sign-in")} variant="primary" className="mt-2">
					Sign In
				</Button>

				<Pressable onPress={() => router.back()} className="items-center">
					<Text className="text-foreground-500">Cancel</Text>
				</Pressable>
			</View>
		</View>
	);
}
