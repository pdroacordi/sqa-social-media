import { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "./components/HeaderComponent";

export abstract class BasePage {
  readonly header: HeaderComponent;

  protected constructor(
    protected readonly page: Page,
    readonly path: string,
  ) {
    this.header = new HeaderComponent(page);
  }

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  async waitUntilOpen(): Promise<void> {
    await this.page.waitForURL(this.path);
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }

  async acceptDialogDuring(action: () => Promise<void>): Promise<string> {
    const dialogMessage = new Promise<string>((resolve) => {
      this.page.once("dialog", async (dialog) => {
        resolve(dialog.message());
        await dialog.accept();
      });
    });
    await action();
    return dialogMessage;
  }
}
