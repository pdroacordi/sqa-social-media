import { Page } from "@playwright/test";
import { PostListPage } from "./PostListPage";

export class FeedPage extends PostListPage {
  constructor(page: Page) {
    super(page, "/");
  }
}
