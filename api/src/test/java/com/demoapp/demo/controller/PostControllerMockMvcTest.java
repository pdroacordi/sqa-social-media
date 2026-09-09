package com.demoapp.demo.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.demoapp.demo.service.PostService;

/**
 * Testes com MockMvc para os endpoints de /posts, mockando o PostService.
 */
@WebMvcTest(PostController.class)
class PostControllerMockMvcTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private PostService postService;

  @Test
  @DisplayName("dado userId ausente, quando getLikedPosts, entao deveria retornar o erro de dominio (BUG: Spring intercepta antes com sua propria resposta)")
  void dadoUserIdAusente_quandoGetLikedPosts_entaoDeveriaRetornarErroConsistenteDoDominio() throws Exception {
    // O controller define um ErrorResponse customizado {"message":"userId é obrigatório","status":400}
    // para o caso de userId == null (PostController.java:44-48), mas como o parametro e
    // @RequestParam Long userId (obrigatorio para o Spring), a ausencia do parametro nunca
    // chega a executar o corpo do metodo: o Spring MVC responde antes com seu proprio erro,
    // que nao tem esse formato de corpo.
    mockMvc.perform(get("/posts/liked"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message", is("userId é obrigatório")));
  }

  @Test
  @DisplayName("dado parametros validos, quando toggleLike, entao retorna 200 com postId e liked")
  void dadoParametrosValidos_quandoToggleLike_entaoRetorna200ComPostIdELiked() throws Exception {
    Map<String, Object> resultado = new HashMap<>();
    resultado.put("postId", 10L);
    resultado.put("liked", true);
    given(postService.toggleLike(anyLong(), anyLong())).willReturn(resultado);

    mockMvc.perform(post("/posts/10/like").param("userId", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.postId", is(10)))
        .andExpect(jsonPath("$.liked", is(true)));
  }
}
