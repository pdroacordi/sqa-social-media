import { expect, test } from "../../src/fixtures";
import { PostPage } from "../../src/models/Post";

const FIRST_PAGE = { limit: 10, skip: 0 };

test.describe("Reações na página inicial", () => {
  test("exibe junto a cada post o número de likes e dislikes vindo da API", async ({ feedPage, postsApi }) => {
    const { posts }: PostPage = await (await postsApi.list(FIRST_PAGE)).json();

    await feedPage.open();
    await expect(feedPage.posts).toHaveCount(posts.length);

    for (const [index, post] of posts.entries()) {
      const card = feedPage.post(index);
      await expect(card.title).toHaveText(post.title);
      await expect(card.likes).toHaveText(String(post.reactions.likes));
      await expect(card.dislikes).toHaveText(String(post.reactions.dislikes));
    }
  });

  test("mantém o número de likes e dislikes ao curtir um post", async ({ signedInUser, feedPage }) => {
    const post = feedPage.post(0);
    const likesBefore = await post.likes.innerText();
    const dislikesBefore = await post.dislikes.innerText();

    await post.toggleLike();

    await expect(post.likeButton).toHaveText(/Curtido/);
    await expect(post.likes).toHaveText(likesBefore);
    await expect(post.dislikes).toHaveText(dislikesBefore);
  });
});
