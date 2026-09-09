import { isPasswordValid, getPasswordValidationMessage } from "@/utils/password";

describe("isPasswordValid / getPasswordValidationMessage", () => {
  test("dado senha forte, quando validar senha, entao retorna true", () => {
    expect(isPasswordValid("Password123@")).toBe(true);
  });

  test("dado senha com exatamente 8 caracteres, quando validar senha, entao deveria retornar true (BUG: length <= 8 exige na pratica 9+ caracteres)", () => {
    expect(isPasswordValid("Abcdef1@")).toBe(true);
  });

  test("dado senha cujo unico caractere especial e '!', quando validar senha, entao deveria aceitar (BUG: '!' nao esta em nenhum dos dois conjuntos de caracteres especiais do frontend)", () => {
    expect(isPasswordValid("Password123!")).toBe(true);
  });

  test("dado senha com unico caractere especial sendo ponto, quando comparar validacao e mensagem, entao deveriam concordar (BUG: regexes divergentes)", () => {
    const senha = "Abcdefgh1.";
    const mensagem = getPasswordValidationMessage(senha);
    const valida = isPasswordValid(senha);

    expect(valida).toBe(mensagem === "");
  });

  test("dado senha sem letra maiuscula, quando obter mensagem de validacao, entao lista o requisito faltante", () => {
    expect(getPasswordValidationMessage("password123!")).toContain("uma letra maiúscula");
  });

  test("dado senha vazia, quando obter mensagem de validacao, entao retorna 'Senha é obrigatória'", () => {
    expect(getPasswordValidationMessage("")).toBe("Senha é obrigatória");
  });
});
