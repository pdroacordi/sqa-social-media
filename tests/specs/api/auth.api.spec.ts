import { UserFactory } from "../../src/data/UserFactory";
import { expect, test } from "../../src/fixtures";

test.describe("POST /auth/signup", () => {
  test("cadastra um novo usuário e retorna seus dados", async ({ authApi }) => {
    const credentials = UserFactory.valid();

    const response = await authApi.signUp(credentials);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: expect.any(Number), email: credentials.email });
  });

  test("rejeita e-mail já cadastrado com 409", async ({ authApi, registeredUser }) => {
    const response = await authApi.signUp(registeredUser);

    await expect(response).toBeApiError(409, "E-mail já está em uso");
  });

  test("rejeita e-mail sem @ com 422", async ({ authApi }) => {
    const response = await authApi.signUp(UserFactory.withInvalidEmail());

    await expect(response).toBeApiError(422, "E-mail inválido");
  });

  test("rejeita senha fora do padrão de força com 422", async ({ authApi }) => {
    const response = await authApi.signUp(UserFactory.withWeakPassword());

    await expect(response).toBeApiError(422, "Senha inválida");
  });
});

test.describe("POST /auth/signin", () => {
  test("autentica usuário com credenciais corretas", async ({ authApi, registeredUser }) => {
    const response = await authApi.signIn(registeredUser);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: registeredUser.id, email: registeredUser.email });
  });

  test("recusa senha incorreta com 401", async ({ authApi, registeredUser }) => {
    const response = await authApi.signIn(UserFactory.withWrongPassword(registeredUser));

    await expect(response).toBeApiError(401, "Credenciais inválidas");
  });

  test("recusa e-mail não cadastrado com 401", async ({ authApi }) => {
    const response = await authApi.signIn(UserFactory.valid());

    await expect(response).toBeApiError(401, "Credenciais inválidas");
  });
});

test.describe("POST /auth/reset-password", () => {
  test("confirma a redefinição para e-mail cadastrado", async ({ authApi, registeredUser }) => {
    const response = await authApi.resetPassword(registeredUser.email);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ message: "Senha redefinida com sucesso (fake)" });
  });

  test("retorna 404 para e-mail não cadastrado", async ({ authApi }) => {
    const response = await authApi.resetPassword(UserFactory.valid().email);

    await expect(response).toBeApiError(404, "Usuário não encontrado");
  });
});
