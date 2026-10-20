import { expect, test } from "../../src/fixtures";
import { LikeToggle, PostPage } from "../../src/models/Post";

const POST_ID = 1;

test.describe("GET /posts", () => {
  test("retorna a página solicitada sem curtidas para visitante", async ({ postsApi }) => {
    const response = await postsApi.list({ limit: 5, skip: 10 });

    expect(response.status()).toBe(200);
    const body: PostPage = await response.json();
    expect(body).toMatchObject({ limit: 5, skip: 10 });
    expect(body.posts).toHaveLength(5);
    expect(body.posts.map((post) => post.liked)).not.toContain(true);
  });

  test("marca como curtido o post que o usuário curtiu", async ({ postsApi, registeredUser }) => {
    await postsApi.toggleLike(POST_ID, registeredUser.id);

    const response = await postsApi.list({ limit: 1, userId: registeredUser.id });

    const body: PostPage = await response.json();
    expect(body.posts[0]).toMatchObject({ id: POST_ID, liked: true });
  });
});

test.describe("Reações dos posts (likes e dislikes)", () => {
  const PAGE = { limit: 10, skip: 0 };

  test("GET /posts inclui reactions com likes e dislikes em todos os posts", async ({ postsApi }) => {
    const body: PostPage = await (await postsApi.list(PAGE)).json();

    expect(body.posts).toHaveLength(PAGE.limit);
    for (const post of body.posts) {
      expect(post.reactions).toEqual({
        likes: expect.any(Number),
        dislikes: expect.any(Number),
      });
    }
  });

  test("GET /posts repassa as reactions publicadas pelo DummyJSON", async ({ postsApi, dummyJsonApi }) => {
    const body: PostPage = await (await postsApi.list(PAGE)).json();
    const dummyJsonPosts = await dummyJsonApi.listPosts(PAGE);

    expect(body.posts.map(({ id, reactions }) => ({ id, reactions }))).toEqual(
      dummyJsonPosts.map(({ id, reactions }) => ({ id, reactions })),
    );
  });

  test("GET /posts/liked inclui as reactions do post curtido", async ({ postsApi, dummyJsonApi, registeredUser }) => {
    await postsApi.toggleLike(POST_ID, registeredUser.id);

    const body: PostPage = await (await postsApi.listLiked(registeredUser.id)).json();
    const dummyJsonPost = await dummyJsonApi.getPost(POST_ID);

    expect(body.posts).toEqual([expect.objectContaining({ id: POST_ID, reactions: dummyJsonPost.reactions })]);
  });
});

test.describe("POST /posts/{postId}/like", () => {
  test("alterna a curtida do usuário a cada chamada", async ({ postsApi, registeredUser }) => {
    const firstToggle: LikeToggle = await (await postsApi.toggleLike(POST_ID, registeredUser.id)).json();
    const secondToggle: LikeToggle = await (await postsApi.toggleLike(POST_ID, registeredUser.id)).json();

    expect(firstToggle).toEqual({ postId: POST_ID, liked: true });
    expect(secondToggle).toEqual({ postId: POST_ID, liked: false });
  });
});

test.describe("GET /posts/liked", () => {
  test("lista somente os posts curtidos pelo usuário", async ({ postsApi, registeredUser }) => {
    await postsApi.toggleLike(POST_ID, registeredUser.id);

    const response = await postsApi.listLiked(registeredUser.id);

    expect(response.status()).toBe(200);
    const body: PostPage = await response.json();
    expect(body.total).toBe(1);
    expect(body.posts).toEqual([expect.objectContaining({ id: POST_ID, liked: true })]);
  });

  test("retorna lista vazia para usuário sem curtidas", async ({ postsApi, registeredUser }) => {
    const response = await postsApi.listLiked(registeredUser.id);

    const body: PostPage = await response.json();
    expect(body).toMatchObject({ total: 0, posts: [] });
  });
});
