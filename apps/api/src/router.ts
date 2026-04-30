import { attachmentRouter } from "./handlers/attachment";
import { bookmarkRouter } from "./handlers/bookmark";
import { commentRouter } from "./handlers/comment";
import { communityRouter } from "./handlers/community";
import { feedRouter } from "./handlers/feed";
import { postRouter } from "./handlers/post";
import { searchRouter } from "./handlers/search";
import { pub } from "./procedures";

export const router = pub.router({
	attachment: attachmentRouter,
	bookmark: bookmarkRouter,
	community: communityRouter,
	feed: feedRouter,
	post: postRouter,
	comment: commentRouter,
	search: searchRouter,
});
