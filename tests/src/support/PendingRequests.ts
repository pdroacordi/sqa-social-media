import { expect, Page, Request } from "@playwright/test";

export class PendingRequests {
  private count = 0;

  constructor(
    page: Page,
    private readonly pattern: RegExp,
  ) {
    page.on("request", (request) => this.track(request, 1));
    page.on("requestfinished", (request) => this.track(request, -1));
    page.on("requestfailed", (request) => this.track(request, -1));
  }

  async settle(): Promise<void> {
    await expect.poll(() => this.count).toBe(0);
  }

  private track(request: Request, delta: number): void {
    if (this.pattern.test(request.url())) {
      this.count += delta;
    }
  }
}
