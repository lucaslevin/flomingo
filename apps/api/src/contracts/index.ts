import { bookmarkContract } from "./bookmark";
import { commentContract } from "./comment";
import { communityContract } from "./community";
import { postContract } from "./post";
import { searchContract } from "./search";

export const contract = {
	bookmark: bookmarkContract,
	community: communityContract,
	post: postContract,
	comment: commentContract,
	search: searchContract,
};
