import { UserFactory } from "../../src/data/UserFactory";
import { expect, test } from "../../src/fixtures";

test.describe("Bugs conhecidos da API", { tag: "@bug" }, () => {
  test.fail("signin com senha incorreta fora do padrão de força deveria retornar 401", async ({ authApi, registeredUser }) => {
    const response = await authApi.signIn(UserFactory.withWeakWrongPassword(registeredUser));

    await expect(response).toBeApiError(401, "Credenciais inválidas");
  });

  test.fail("cadastro sem senha deveria retornar 422 em vez de 500", async ({ authApi }) => {
    const response = await authApi.signUp({ email: UserFactory.valid().email });

    await expect(response).toBeApiError(422, "Senha inválida");
  });

  test.fail("cadastro deveria rejeitar e-mail sem domínio", async ({ authApi }) => {
    const response = await authApi.signUp(UserFactory.withEmailWithoutDomain());

    await expect(response).toBeApiError(422, "E-mail inválido");
  });

  test.fail("signin não deveria expor a senha do usuário na resposta", async ({ authApi, registeredUser }) => {
    const response = await authApi.signIn(registeredUser);

    expect(await response.json()).not.toHaveProperty("password");
  });
});
