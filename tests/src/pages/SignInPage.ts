import { Locator, Page } from "@playwright/test";
import { Credentials } from "../models/User";
import { BasePage } from "./BasePage";
import { FormField } from "./components/FormField";

export class SignInPage extends BasePage {
  private readonly email: FormField;
  private readonly password: FormField;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page, "/signin");
    this.email = new FormField(page, "Email");
    this.password = new FormField(page, "Senha");
    this.submitButton = page.locator("form").getByRole("button", { name: "Entrar" });
  }

  async signIn({ email, password }: Credentials): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}
