export interface Reactions {
  likes: number;
  dislikes: number;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  liked: boolean;
  reactions: Reactions;
}

export interface DummyJsonPost {
  id: number;
  reactions: Reactions;
}

export interface DummyJsonPostPage {
  posts: DummyJsonPost[];
}

export interface PostPage {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

export interface LikeToggle {
  postId: number;
  liked: boolean;
}

export interface PostQuery {
  limit?: number;
  skip?: number;
  userId?: number;
}
