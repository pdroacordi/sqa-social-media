import { Locator, Page } from "@playwright/test";
import { Credentials } from "../models/User";
import { BasePage } from "./BasePage";
import { FormField } from "./components/FormField";

export class SignUpPage extends BasePage {
  private readonly email: FormField;
  private readonly password: FormField;
  private readonly confirmPassword: FormField;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page, "/signup");
    this.email = new FormField(page, "Email");
    this.password = new FormField(page, "Senha");
    this.confirmPassword = new FormField(page, "Confirmar Senha");
    this.submitButton = page.locator("form").getByRole("button", { name: "Criar Conta" });
  }

  async signUp({ email, password }: Credentials): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.confirmPassword.fill(password);
    await this.submitButton.click();
  }
}
