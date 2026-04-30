import { ThemeProvider } from "@react-navigation/native";
import "../global.css";

import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "@/lib/theme";

export default function RootLayout() {
	const theme = useTheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={theme}>
				<HeroUINativeProvider>
					<Stack>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen name="post/[id]" options={{ title: "Post", headerBackTitle: "Back" }} />
						<Stack.Screen name="post/new" options={{ title: "Create Post", headerBackTitle: "Cancel", presentation: "modal" }} />
						<Stack.Screen name="community/new" options={{ title: "Create Community", headerBackTitle: "Cancel", presentation: "modal" }} />
						<Stack.Screen name="(auth)/sign-in" options={{ title: "Sign In", presentation: "modal", headerTransparent: true }} />
					</Stack>
				</HeroUINativeProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
