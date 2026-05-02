import { Stack } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useCommunities } from "@/hooks/use-communities";
import { authClient } from "@/lib/auth-client";

export default function CommunitiesScreen() {
	const { data: session } = authClient.useSession();
	const isSignedIn = !!session?.user;
	const { communities, isLoading } = useCommunities();

	return (
		<>
			<Stack.Screen.Title>Clubs</Stack.Screen.Title>
			<ScrollView contentInsetAdjustmentBehavior="automatic">
				<View className="p-4 bg-background">
					{isSignedIn && (
						<View className="mb-6">
							<Text className="text-lg font-semibold mb-3">My Communities</Text>
							<View className="bg-content1 rounded-lg p-4">
								<Text className="text-foreground-500 text-sm">Follow communities to see them here</Text>
							</View>
						</View>
					)}

					<View>
						<Text className="text-lg font-semibold mb-3">Discover</Text>
						<View className="gap-3">
							{communities.map((community) => (
								<View key={community.id} className="bg-content1 rounded-lg p-4">
									<View className="flex-row items-center justify-between">
										<View className="flex-1">
											<Text className="font-medium">c/{community.slug}</Text>
											<Text className="text-sm text-foreground-500">{community.description}</Text>
										</View>
									</View>
								</View>
							))}
							{!isLoading && communities.length === 0 && <Text className="text-foreground-400 text-center py-4">No communities yet</Text>}
						</View>
					</View>
				</View>
			</ScrollView>
		</>
	);
}
