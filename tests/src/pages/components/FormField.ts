import { Locator, Page } from "@playwright/test";

export class FormField {
  private readonly input: Locator;

  constructor(page: Page, label: string) {
    this.input = page.locator(`label:text-is("${label}") + input`);
  }

  async fill(value: string): Promise<void> {
    await this.input.fill(value);
  }
}
