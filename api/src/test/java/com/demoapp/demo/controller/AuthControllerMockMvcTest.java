package com.demoapp.demo.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.demoapp.demo.model.User;
import com.demoapp.demo.service.UserService;

/**
 * Testes com MockMvc: exercitam os endpoints HTTP de /auth (status, corpo JSON e mensagens),
 * mockando o UserService para isolar a camada de contrato da API.
 */
@WebMvcTest(AuthController.class)
class AuthControllerMockMvcTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private UserService service;

  private User usuarioExistente(String email, String senha) {
    User user = new User();
    user.setId(1L);
    user.setEmail(email);
    user.setPassword(senha);
    return user;
  }

  @Test
  @DisplayName("dado e-mail ja cadastrado, quando signup, entao retorna 409")
  void dadoEmailJaCadastrado_quandoSignup_entaoRetorna409() throws Exception {
    given(service.isEmailValid(anyString())).willReturn(true);
    given(service.isPasswordValid(anyString())).willReturn(true);
    given(service.findByEmail("existente@teste.com")).willReturn(usuarioExistente("existente@teste.com", "Senha123!"));

    mockMvc.perform(post("/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"existente@teste.com\",\"password\":\"Senha123!\"}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message", is("E-mail já está em uso")))
        .andExpect(jsonPath("$.status", is(409)));
  }

  @Test
  @DisplayName("dado e-mail invalido, quando signup, entao retorna 422")
  void dadoEmailInvalido_quandoSignup_entaoRetorna422() throws Exception {
    given(service.isEmailValid(anyString())).willReturn(false);

    mockMvc.perform(post("/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"invalido\",\"password\":\"Senha123!\"}"))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.message", is("E-mail inválido")))
        .andExpect(jsonPath("$.status", is(422)));
  }

  @Test
  @DisplayName("dado credenciais corretas, quando signin, entao retorna 200 com usuario")
  void dadoCredenciaisCorretas_quandoSignin_entaoRetorna200ComUsuario() throws Exception {
    given(service.isEmailValid(anyString())).willReturn(true);
    given(service.isPasswordValid(anyString())).willReturn(true);
    given(service.findByEmail("valido@teste.com")).willReturn(usuarioExistente("valido@teste.com", "Senha123!"));

    mockMvc.perform(post("/auth/signin")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"valido@teste.com\",\"password\":\"Senha123!\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email", is("valido@teste.com")));
  }

  @Test
  @DisplayName("dado senha correta mas fora do padrao de forca, quando signin, entao deveria retornar 401 (BUG: retorna 422 antes de checar credenciais)")
  void dadoSenhaCorretaMasForaDoPadraoDeForca_quandoSignin_entaoDeveriaRetornar401() throws Exception {
    // Usuario cadastrado com uma senha que nao cumpre mais o regex de forca (ex: politica mudou),
    // ou o cliente simplesmente digitou uma senha fraca por engano. O endpoint de login
    // deveria comparar credenciais e responder 401 "Credenciais invalidas", nao revalidar forca.
    given(service.isEmailValid(anyString())).willReturn(true);
    given(service.isPasswordValid(anyString())).willReturn(false);
    given(service.findByEmail(anyString())).willReturn(usuarioExistente("usuario@teste.com", "outraSenha"));

    mockMvc.perform(post("/auth/signin")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"usuario@teste.com\",\"password\":\"fraca\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message", is("Credenciais inválidas")));
  }

  @Test
  @DisplayName("dado e-mail nao cadastrado, quando reset-password, entao retorna 404 com mensagem usuario nao encontrado")
  void dadoEmailNaoCadastrado_quandoResetPassword_entaoRetorna404ComMensagemUsuarioNaoEncontrado() throws Exception {
    given(service.isEmailValid(anyString())).willReturn(true);
    given(service.findByEmail("naocadastrado@teste.com")).willReturn(null);

    mockMvc.perform(post("/auth/reset-password")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"naocadastrado@teste.com\"}"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message", is("Usuário não encontrado")));
  }

  @Test
  @DisplayName("dado e-mail cadastrado, quando reset-password, entao retorna 200 com mensagem fake (documenta que o endpoint e um stub)")
  void dadoEmailCadastrado_quandoResetPassword_entaoRetorna200ComMensagemFake() throws Exception {
    given(service.isEmailValid(anyString())).willReturn(true);
    given(service.findByEmail("cadastrado@teste.com")).willReturn(usuarioExistente("cadastrado@teste.com", "Senha123!"));

    mockMvc.perform(post("/auth/reset-password")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"cadastrado@teste.com\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message", is("Senha redefinida com sucesso (fake)")));
  }
}
