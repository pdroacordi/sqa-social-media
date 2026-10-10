import { Locator, Page } from "@playwright/test";

export class HeaderComponent {
  readonly signInButton: Locator;
  readonly signUpButton: Locator;
  readonly likedPostsButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    const header = page.locator("header");
    this.signInButton = header.getByRole("button", { name: "Entrar", exact: true });
    this.signUpButton = header.getByRole("button", { name: "Criar Conta", exact: true });
    this.likedPostsButton = header.getByRole("button", { name: "Posts Curtidos", exact: true });
    this.logoutButton = header.getByRole("button", { name: "Sair", exact: true });
  }

  async goToLikedPosts(): Promise<void> {
    await this.likedPostsButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
