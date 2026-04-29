import { bookmarkRouter } from "./handlers/bookmark";
import { commentRouter } from "./handlers/comment";
import { communityRouter } from "./handlers/community";
import { postRouter } from "./handlers/post";
import { searchRouter } from "./handlers/search";
import { pub } from "./procedures";

export const router = pub.router({
	bookmark: bookmarkRouter,
	community: communityRouter,
	post: postRouter,
	comment: commentRouter,
	search: searchRouter,
});
