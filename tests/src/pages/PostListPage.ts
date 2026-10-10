import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { PostCardComponent } from "./components/PostCardComponent";

export abstract class PostListPage extends BasePage {
  readonly posts: Locator;

  protected constructor(page: Page, path: string) {
    super(page, path);
    this.posts = page.getByRole("listitem");
  }

  post(index: number): PostCardComponent {
    return new PostCardComponent(this.posts.nth(index));
  }
}
