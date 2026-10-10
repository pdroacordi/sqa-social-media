import { UserFactory } from "../../src/data/UserFactory";
import { expect, test } from "../../src/fixtures";

test.describe("Login e logout", () => {
  test("credenciais inválidas exibem mensagem de erro", async ({ page, signInPage, registeredUser }) => {
    await signInPage.open();

    await signInPage.signIn(UserFactory.withWrongPassword(registeredUser));

    await expect(signInPage.message("Credenciais inválidas")).toBeVisible();
    await expect(page).toHaveURL(signInPage.path);
  });

  test("usuário faz login, sai e volta a navegar como visitante", async ({ page, signInPage, feedPage, registeredUser }) => {
    await signInPage.open();

    await signInPage.signIn(registeredUser);

    await expect(page).toHaveURL(feedPage.path);
    await expect(feedPage.header.logoutButton).toBeVisible();

    await feedPage.header.logout();

    await expect(feedPage.header.signInButton).toBeVisible();
    await expect(feedPage.header.signUpButton).toBeVisible();
    await expect(feedPage.header.logoutButton).toBeHidden();
  });
});
