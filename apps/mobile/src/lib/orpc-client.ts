import { contract } from "@flomingo/api/contracts";
import { createORPCClient, onError } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { authClient } from "./auth-client";

const link = new OpenAPILink(contract, {
	url: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/rpc",
	headers: () => {
		const cookie = authClient.getCookie();
		return cookie ? { Cookie: cookie } : {};
	},
	interceptors: [
		onError((error) => {
			if (error.code === "UNAUTHORIZED") {
				return;
			}
			console.error(error);
		}),
	],
});

export const orpcClient: JsonifiedClient<ContractRouterClient<typeof contract>> = createORPCClient(link);
