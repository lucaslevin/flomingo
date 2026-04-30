import { router } from "expo-router";
import { Button, Input, Label } from "heroui-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { authClient } from "@/lib/auth-client";

export default function SignIn() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			if (isSignUp) {
				await authClient.signUp.email({
					email,
					password,
					name: username,
				});
			} else {
				await authClient.signIn.email({
					email,
					password,
				});
			}
			router.back();
		} catch {
			Alert.alert("Error", "Failed to sign in. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuth = async (provider: "google" | "apple") => {
		setIsLoading(true);
		try {
			await authClient.signIn.social({
				provider,
				callbackURL: "flomingo://",
			});
			router.back();
		} catch {
			Alert.alert("Error", `Failed to sign in with ${provider}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic" className="bg-background">
			<View className="p-6 gap-6">
				<Text className="text-2xl font-bold text-center">{isSignUp ? "Create Account" : "Welcome Back"}</Text>

				<View className="gap-4">
					{isSignUp && (
						<View className="gap-2">
							<Label>Username</Label>
							<Input value={username} onChangeText={setUsername} placeholder="username" autoCapitalize="none" />
						</View>
					)}

					<View className="gap-2">
						<Label>Email</Label>
						<Input value={email} onChangeText={setEmail} placeholder="email@example.com" autoCapitalize="none" keyboardType="email-address" />
					</View>

					<View className="gap-2">
						<Label>Password</Label>
						<Input value={password} onChangeText={setPassword} placeholder="password" secureTextEntry />
					</View>

					<Button onPress={handleSubmit} isLoading={isLoading} variant="primary" className="mt-2">
						{isSignUp ? "Create Account" : "Sign In"}
					</Button>
				</View>

				<View className="flex-row items-center gap-2">
					<View className="flex-1 h-px bg-foreground-200" />
					<Text className="text-foreground-400 text-sm">or continue with</Text>
					<View className="flex-1 h-px bg-foreground-200" />
				</View>

				<View className="gap-3">
					<Pressable
						onPress={() => handleOAuth("google")}
						disabled={isLoading}
						className="flex-row items-center justify-center gap-3 bg-white rounded-lg p-4"
						style={{ borderCurve: "continuous" }}
					>
						<Text>Google</Text>
					</Pressable>

					<Pressable
						onPress={() => handleOAuth("apple")}
						disabled={isLoading}
						className="flex-row items-center justify-center gap-3 bg-white rounded-lg p-4"
						style={{ borderCurve: "continuous" }}
					>
						<Text>Apple</Text>
					</Pressable>
				</View>

				<Pressable onPress={() => setIsSignUp(!isSignUp)} className="items-center">
					<Text className="text-foreground-500">{isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}
