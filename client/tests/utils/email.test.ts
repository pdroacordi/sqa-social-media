import { isEmailValid, getEmailValidationMessage } from "@/utils/email";

describe("isEmailValid / getEmailValidationMessage", () => {
  test("dado email valido, quando validar email, entao retorna true", () => {
    expect(isEmailValid("teste@exemplo.com")).toBe(true);
  });

  test("dado email sem arroba, quando validar email, entao retorna false", () => {
    expect(isEmailValid("testeexemplo.com")).toBe(false);
  });

  test("dado email com espacos, quando validar email, entao retorna false", () => {
    expect(isEmailValid("teste @exemplo.com")).toBe(false);
  });

  test("dado email vazio, quando obter mensagem de validacao, entao retorna 'Email é obrigatório'", () => {
    expect(getEmailValidationMessage("")).toBe("Email é obrigatório");
  });

  test("dado email sem dominio, quando obter mensagem de validacao, entao retorna 'Email inválido'", () => {
    expect(getEmailValidationMessage("usuario@")).toBe("Email inválido");
  });
});
