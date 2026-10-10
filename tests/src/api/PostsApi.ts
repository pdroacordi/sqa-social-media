import { APIRequestContext, APIResponse } from "@playwright/test";
import { PostQuery } from "../models/Post";

export class PostsApi {
  constructor(private readonly request: APIRequestContext) {}

  list(query: PostQuery = {}): Promise<APIResponse> {
    return this.request.get("/posts", { params: { ...query } });
  }

  listLiked(userId: number): Promise<APIResponse> {
    return this.request.get("/posts/liked", { params: { userId } });
  }

  toggleLike(postId: number, userId: number): Promise<APIResponse> {
    return this.request.post(`/posts/${postId}/like`, { params: { userId } });
  }
}
