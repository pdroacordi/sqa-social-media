export interface Post {
  id: number;
  title: string;
  body: string;
  liked: boolean;
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
