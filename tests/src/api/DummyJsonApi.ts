import { APIRequestContext } from "@playwright/test";
import { DummyJsonPost, DummyJsonPostPage, PostQuery } from "../models/Post";

export class DummyJsonApi {
  constructor(private readonly request: APIRequestContext) {}

  async listPosts(query: Omit<PostQuery, "userId"> = {}): Promise<DummyJsonPost[]> {
    const response = await this.request.get("/posts", { params: { ...query } });
    const page: DummyJsonPostPage = await response.json();
    return page.posts;
  }

  async getPost(postId: number): Promise<DummyJsonPost> {
    const response = await this.request.get(`/posts/${postId}`);
    return response.json();
  }
}
