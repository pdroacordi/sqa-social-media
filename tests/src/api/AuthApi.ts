import { APIRequestContext, APIResponse } from "@playwright/test";
import { Credentials, RegisteredUser } from "../models/User";

export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

  signUp({ email, password }: Partial<Credentials>): Promise<APIResponse> {
    return this.request.post("/auth/signup", { data: { email, password } });
  }

  signIn({ email, password }: Credentials): Promise<APIResponse> {
    return this.request.post("/auth/signin", { data: { email, password } });
  }

  resetPassword(email: string): Promise<APIResponse> {
    return this.request.post("/auth/reset-password", { data: { email } });
  }

  async register(credentials: Credentials): Promise<RegisteredUser> {
    const response = await this.signUp(credentials);
    if (!response.ok()) {
      throw new Error(`Falha ao cadastrar usuário de teste: HTTP ${response.status()}`);
    }
    const { id } = await response.json();
    return { ...credentials, id };
  }
}
