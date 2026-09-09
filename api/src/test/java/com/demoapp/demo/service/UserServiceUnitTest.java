package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserServiceUnitTest {

  private final UserService service = new UserService(null);

  @Test
  @DisplayName("dado uma senha forte, quando validar a senha, entao retorna true")
  void dadoSenhaForte_quandoValidarSenha_entaoRetornaTrue() {
    assertTrue(service.isPasswordValid("Password123!"));
  }

  @Test
  @DisplayName("dado uma senha sem caractere especial, quando validar a senha, entao retorna false")
  void dadoSenhaSemCaractereEspecial_quandoValidarSenha_entaoRetornaFalse() {
    assertFalse(service.isPasswordValid("Password123"));
  }

  @Test
  @DisplayName("dado um e-mail sem dominio, quando validar o e-mail, entao deveria retornar false (BUG: so verifica presenca de '@')")
  void dadoEmailSemDominio_quandoValidarEmail_entaoDeveriaRetornarFalse() {
    assertFalse(service.isEmailValid("user@"),
        "Esperado que 'user@' fosse invalido, mas isEmailValid so verifica a presenca de '@'");
  }

  @Test
  @DisplayName("dado uma senha com caractere especial fora do conjunto permitido, quando validar a senha, entao deveria aceitar (BUG: regex restringe os especiais aceitos)")
  void dadoSenhaComCaractereEspecialForaDoConjuntoPermitido_quandoValidarSenha_entaoDeveriaAceitar() {
    assertTrue(service.isPasswordValid("Password123#"),
        "Esperado que 'Password123#' fosse aceita (tem 1 caractere especial), mas a regex so permite @$!%*?&");
  }

  @Test
  @DisplayName("dado uma senha nula, quando validar a senha, entao deveria retornar false sem lancar excecao (BUG: lanca NullPointerException)")
  void dadoSenhaNula_quandoValidarSenha_entaoDeveriaRetornarFalseSemLancarExcecao() {
    assertDoesNotThrow(() -> assertFalse(service.isPasswordValid(null)),
        "Esperado que senha nula fosse tratada como invalida, mas Pattern.matches lanca NullPointerException");
  }
}
