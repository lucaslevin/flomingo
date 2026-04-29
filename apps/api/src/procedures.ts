import { auth } from "@flomingo/auth";
import { implement, ORPCError } from "@orpc/server";
import { contract } from "./contracts/index";

const os = implement(contract);

export const pub = os.$context<{ headers: Headers }>();

export const authed = pub.use(async ({ context, next }) => {
	const session = await auth.api.getSession({ headers: context.headers });

	if (!session) {
		throw new ORPCError("UNAUTHORIZED", { message: "Not authenticated" });
	}

	return next({
		context: { user: session.user, session: session.session },
	});
});
