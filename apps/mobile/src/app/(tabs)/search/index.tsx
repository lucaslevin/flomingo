import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import type { NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
import { ScrollView, Text, View } from "react-native";
import { SearchResultCard } from "@/components/search/search-result-card";
import { useSearch } from "@/hooks/use-search";

export default function SearchScreen() {
	const [inputValue, setInputValue] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(inputValue);
		}, 300);
		return () => clearTimeout(timer);
	}, [inputValue]);

	const handleChange = (value: string | NativeSyntheticEvent<TextInputChangeEventData>) => {
		const text = typeof value === "string" ? value : (value.nativeEvent?.text ?? "");
		setInputValue(text);
	};

	const { results, isLoading } = useSearch(debouncedQuery);

	return (
		<>
			<Stack.Screen.Title>Search</Stack.Screen.Title>
			<Stack.SearchBar placement="automatic" placeholder="Search" onChangeText={handleChange} />

			<ScrollView contentInsetAdjustmentBehavior="automatic">
				<View className="p-4 bg-background">
					<View className="mt-4 gap-3">
						{results.map((result) => (
							<SearchResultCard key={result.id} result={result} />
						))}
						{debouncedQuery.length >= 2 && results.length === 0 && !isLoading && (
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
