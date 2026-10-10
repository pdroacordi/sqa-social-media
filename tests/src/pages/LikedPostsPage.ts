import { Locator, Page } from "@playwright/test";
import { PendingRequests } from "../support/PendingRequests";
import { PostListPage } from "./PostListPage";

export class LikedPostsPage extends PostListPage {
  readonly emptyState: Locator;
  private readonly heading: Locator;
  private readonly loadingIndicator: Locator;
  private readonly likedPostsRequests: PendingRequests;

  constructor(page: Page) {
    super(page, "/auth/liked");
    this.emptyState = this.message("Você ainda não curtiu nenhum post.");
    this.heading = page.getByRole("heading", { name: "Posts Curtidos", level: 1 });
    this.loadingIndicator = this.message("Carregando posts curtidos...");
    this.likedPostsRequests = new PendingRequests(page, /\/posts\/liked/);
  }

  async waitUntilLoaded(): Promise<void> {
    await this.heading.waitFor();
    await this.loadingIndicator.waitFor({ state: "hidden" });
    await this.likedPostsRequests.settle();
  }
}
