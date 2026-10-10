import { UserFactory } from "../../src/data/UserFactory";
import { expect, test } from "../../src/fixtures";

test.describe("Cadastro", () => {
  test("visitante cria uma conta e chega ao feed autenticado", async ({ page, signUpPage, feedPage }) => {
    await signUpPage.open();

    await signUpPage.signUp(UserFactory.valid());

    await expect(page).toHaveURL(feedPage.path);
    await expect(feedPage.header.likedPostsButton).toBeVisible();
    await expect(feedPage.header.logoutButton).toBeVisible();
  });

  test("cadastro com e-mail já utilizado exibe o erro da API", async ({ page, signUpPage, registeredUser }) => {
    await signUpPage.open();

    await signUpPage.signUp(registeredUser);

    await expect(signUpPage.message("E-mail já está em uso")).toBeVisible();
    await expect(page).toHaveURL(signUpPage.path);
  });
});
