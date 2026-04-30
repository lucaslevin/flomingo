import { attachmentContract } from "./attachment";
import { bookmarkContract } from "./bookmark";
import { commentContract } from "./comment";
import { communityContract } from "./community";
import { feedContract } from "./feed";
import { postContract } from "./post";
import { searchContract } from "./search";

export const contract = {
	attachment: attachmentContract,
	bookmark: bookmarkContract,
	community: communityContract,
	feed: feedContract,
	post: postContract,
	comment: commentContract,
	search: searchContract,
};
