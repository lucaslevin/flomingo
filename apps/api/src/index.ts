import { auth } from "@flomingo/auth";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError, ValidationError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { Hono } from "hono";
import * as z from "zod";
import { router } from "./router";

const app = new Hono();

const handler = new OpenAPIHandler(router, {
	plugins: [
		new OpenAPIReferencePlugin({
			docsProvider: "scalar",
			schemaConverters: [new ZodToJsonSchemaConverter()],
			specGenerateOptions: {
				info: { title: "Flomingo API", version: "1.0.0" },
			},
		}),
	],
	interceptors: [
		onError((error) => {
			if (error instanceof ORPCError && error.code === "BAD_REQUEST" && error.cause instanceof ValidationError) {
				const zodError = new z.ZodError(error.cause.issues as z.ZodIssue[]);
				throw new ORPCError("INPUT_VALIDATION_FAILED", {
					status: 422,
					message: z.prettifyError(zodError),
					data: z.flattenError(zodError),
					cause: error.cause,
				});
			}

			if (error instanceof ORPCError && error.code === "INTERNAL_SERVER_ERROR" && error.cause instanceof ValidationError) {
				const zodError = new z.ZodError(error.cause.issues as z.ZodIssue[]);
				throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
					status: 500,
					message: z.prettifyError(zodError),
					data: z.flattenError(zodError),
					cause: error.cause,
				});
			}

			console.error(error);
		}),
	],
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

app.use("/rpc/*", async (c, next) => {
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/rpc",
		context: { headers: c.req.raw.headers },
	});

	if (matched) {
		return c.newResponse(response.body, response);
	}

	await next();
});

export default app;
