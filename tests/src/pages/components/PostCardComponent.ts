import { Locator } from "@playwright/test";

const LIKE_ENDPOINT = /\/posts\/\d+\/like/;

export class PostCardComponent {
  readonly title: Locator;
  readonly likeButton: Locator;

  constructor(private readonly root: Locator) {
    this.title = root.getByRole("heading", { level: 2 });
    this.likeButton = root.getByRole("button");
  }

  async toggleLike(): Promise<void> {
    const likeResponse = this.root.page().waitForResponse((response) => LIKE_ENDPOINT.test(response.url()));
    await this.likeButton.click();
    await likeResponse;
  }
}
