import { expect, test } from "../../src/fixtures";

test.describe("Curtidas", () => {
  test("visitante é avisado de que precisa estar autenticado para curtir", async ({ feedPage }) => {
    await feedPage.open();
    const post = feedPage.post(0);

    const alertMessage = await feedPage.acceptDialogDuring(() => post.likeButton.click());

    expect(alertMessage).toBe("Você precisa estar autenticado para curtir posts!");
    await expect(post.likeButton).toHaveText(/Curtir/);
  });

  test("usuário curte um post, encontra-o nos curtidos e descurte", async ({ signedInUser, feedPage, likedPostsPage }) => {
    const post = feedPage.post(0);
    const title = await post.title.innerText();

    await post.toggleLike();
    await expect(post.likeButton).toHaveText(/Curtido/);

    await feedPage.header.goToLikedPosts();
    await likedPostsPage.waitUntilLoaded();
    await expect(likedPostsPage.posts).toHaveCount(1);
    await expect(likedPostsPage.post(0).title).toHaveText(title);

    await likedPostsPage.post(0).toggleLike();
    await expect(likedPostsPage.emptyState).toBeVisible();
    await expect(likedPostsPage.posts).toHaveCount(0);
  });
});
