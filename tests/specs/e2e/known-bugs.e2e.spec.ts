import { UserFactory } from "../../src/data/UserFactory";
import { expect, test } from "../../src/fixtures";

test.describe("Bugs conhecidos do frontend", { tag: "@bug" }, () => {
  test.fail("sessão deveria permanecer após recarregar a página", async ({ page, signedInUser, feedPage }) => {
    await page.reload();

    await expect(feedPage.header.logoutButton).toBeVisible();
  });

  test.fail("cadastro deveria aceitar senha com exatamente 8 caracteres", async ({ page, signUpPage, feedPage }) => {
    await signUpPage.open();

    await signUpPage.signUp(UserFactory.withMinimumLengthPassword());

    await expect(page).toHaveURL(feedPage.path);
  });
});
