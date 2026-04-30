import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import { useThemeColor } from "heroui-native";
import { useColorScheme } from "react-native";

export function useTheme(): Theme {
	const colorScheme = useColorScheme() ?? "light";

	const background = useThemeColor("background");
	const foreground = useThemeColor("foreground");
	const primary = useThemeColor("accent");
	const card = useThemeColor("surface");
	const muted = useThemeColor("muted");

	const base = colorScheme === "dark" ? DarkTheme : DefaultTheme;

	return {
		...base,
		colors: { ...base.colors, background, card, text: foreground, primary, muted },
	} as Theme;
}
