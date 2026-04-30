import type { contract } from "@flomingo/api/contracts";

export type PostOutput = (typeof contract.post.list) extends { output: infer O } ? O extends { posts: infer P } ? P extends Array<infer T> ? T : never : never : never;

export type SearchResult = (typeof contract.search.query) extends { output: infer O } ? O extends { results: infer R } ? R extends Array<infer T> ? T : never : never : never;

export type BookmarkItem = (typeof contract.bookmark.list) extends { output: infer O } ? O extends { bookmarks: infer B } ? B extends Array<infer T> ? T : never : never : never;