import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Button, Input, Label, Separator, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, View } from "react-native";
import { withUniwind } from "uniwind";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

const StyledIonicons = withUniwind(Ionicons);

const schema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required").min(8, "Min 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function SignIn() {
	const [isLoading, setIsLoading] = useState(false);
	const accentForeground = useThemeColor("accent-foreground");

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { username: "", password: "" },
	});

	const onSubmit = async (values: FormValues) => {
		setIsLoading(true);
		try {
			await authClient.signIn.username(values);
			router.back();
		} catch {
			Alert.alert("Error", "Failed to sign in. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuth = async (provider: "google" | "apple" | "facebook") => {
		setIsLoading(true);
		try {
			await authClient.signIn.social({ provider });
			router.back();
		} catch {
			Alert.alert("Error", `Failed to sign in with ${provider}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ScrollView contentInsetAdjustmentBehavior="automatic">
			<View className="p-4 gap-6">
				<View className="gap-1 items-center pt-8 pb-4">
					<Text className="text-2xl font-bold text-foreground">Join the community</Text>
					<Text className="text-muted text-center">Connect with people who share your interests</Text>
				</View>

				<View className="gap-4">
					<Controller
						control={control}
						name="username"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextField isInvalid={!!errors.username}>
								<Label isInvalid={!!errors.username}>Username</Label>
								<Input value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Enter your username" autoCapitalize="none" keyboardType="email-address" />
								{errors.username && <Text className="text-danger text-sm">{errors.username.message}</Text>}
							</TextField>
						)}
					/>

					<Controller
						control={control}
						name="password"
						render={({ field: { onChange, onBlur, value } }) => (
							<TextField isInvalid={!!errors.password}>
								<Label isInvalid={!!errors.password}>Password</Label>
								<Input value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Enter your password" secureTextEntry />
								{errors.password && <Text className="text-danger text-sm">{errors.password.message}</Text>}
							</TextField>
						)}
					/>

					<Button onPress={handleSubmit(onSubmit)} variant="primary" className="mt-2">
						{isLoading ? <Spinner color={accentForeground} /> : <Button.Label>Continue</Button.Label>}
					</Button>
				</View>

				<Separator className="mx-10" />

				<View className="gap-4">
					<Button variant="outline" className="justify-between" onPress={() => handleOAuth("facebook")} isDisabled={isLoading}>
						<Button.Label>Continue with Facebook</Button.Label>
						<StyledIonicons name="logo-facebook" size={20} className="text-foreground" />
					</Button>

					<Button variant="outline" className="justify-between" onPress={() => handleOAuth("google")} isDisabled={isLoading}>
						<Button.Label>Continue with Google</Button.Label>
						<StyledIonicons name="logo-google" size={20} className="text-foreground" />
					</Button>

					<Button variant="outline" className="justify-between" onPress={() => handleOAuth("apple")} isDisabled={isLoading}>
						<Button.Label>Continue with Apple</Button.Label>
						<StyledIonicons name="logo-apple" size={20} className="text-foreground" />
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}
