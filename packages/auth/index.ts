import { expo } from "@better-auth/expo";
import { db } from "@flomingo/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous, username } from "better-auth/plugins";
import { nanoid } from "nanoid";

export const auth = betterAuth({
	appName: "Flomingo",
	advanced: { database: { generateId: () => nanoid() } },
	database: drizzleAdapter(db, { provider: "pg", camelCase: true, usePlural: true }),
	emailAndPassword: { enabled: true },
	experimental: { joins: true },
	plugins: [admin(), anonymous(), username(), expo()],
	socialProviders: {},
	telemetry: { enabled: false },
	trustedOrigins: ["flomingo://", ...(process.env.NODE_ENV === "development" ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"] : [])],
});
