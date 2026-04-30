import "../global.css";

import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<HeroUINativeProvider>
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen
						name="post/[id]"
						options={{
							title: "Post",
							headerBackTitle: "Back",
						}}
					/>
					<Stack.Screen
						name="post/new"
						options={{
							title: "Create Post",
							headerBackTitle: "Cancel",
							presentation: "modal",
						}}
					/>
					<Stack.Screen
						name="community/new"
						options={{
							title: "Create Community",
							headerBackTitle: "Cancel",
							presentation: "modal",
						}}
					/>
					<Stack.Screen
						name="(auth)/sign-in"
						options={{
							title: "Sign In",
							presentation: "modal",
							headerShown: false,
						}}
					/>
					<Stack.Screen
						name="(auth)/auth-prompt"
						options={{
							title: "",
							presentation: "modal",
							headerShown: false,
						}}
					/>
				</Stack>
			</HeroUINativeProvider>
		</GestureHandlerRootView>
	);
}
