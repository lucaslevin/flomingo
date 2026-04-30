import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SearchResultCard } from "@/components/search/search-result-card";
import { useSearch } from "@/hooks/use-search";

export default function SearchScreen() {
	const [query, setQuery] = useState("");
	const { results, isLoading } = useSearch(query);

	return (
		<>
			<Stack.Screen.Title>Search</Stack.Screen.Title>
			<Stack.SearchBar placement="automatic" placeholder="Search" onChangeText={() => {}} />

			<ScrollView contentInsetAdjustmentBehavior="automatic">
				<View className="p-4 bg-background">
					<View className="bg-content1 rounded-lg flex-row items-center px-3 py-2" style={{ borderCurve: "continuous" }}>
						<Ionicons name="search" size={20} color="#878a8c" />
						<TextInput
							className="flex-1 ml-2 text-base"
							placeholder="Search posts and comments..."
							placeholderTextColor="#878a8c"
							value={query}
							onChangeText={setQuery}
							autoCorrect={false}
						/>
					</View>

					<View className="mt-4 gap-3">
						{results.map((result) => (
							<SearchResultCard key={result.id} result={result} />
						))}
						{query.length >= 2 && results.length === 0 && !isLoading && (
							<View className="py-8 items-center">
								<Text className="text-foreground-400">No results found</Text>
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</>
	);
}
