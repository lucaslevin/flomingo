import { Stack } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function MessagesScreen() {
	return (
		<>
			<Stack.Screen.Title>Inbox</Stack.Screen.Title>
			<ScrollView contentInsetAdjustmentBehavior="automatic">
				<View className="p-4 bg-background">
					<View className="mb-6">
						<Text className="text-lg font-semibold mb-3">Messages</Text>
						<View className="bg-content1 rounded-lg p-4">
							<Text className="text-foreground-500 text-sm">Direct messages coming soon</Text>
						</View>
					</View>

					<View>
						<Text className="text-lg font-semibold mb-3">Notifications</Text>
						<View className="bg-content1 rounded-lg p-4">
							<Text className="text-foreground-500 text-sm">Notifications coming soon</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</>
	);
}
