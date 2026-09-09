package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.demoapp.demo.model.UserPostReaction;
import com.demoapp.demo.repository.UserPostReactionRepository;

/**
 * Testes com Mockito: isolam o PostService mockando UserPostReactionRepository,
 * sem subir contexto Spring e sem camada HTTP. toggleLike e o calculo de paginacao
 * de getLikedPosts nao dependem do RestTemplate hardcoded no construtor (ver limitacao
 * de testabilidade documentada no plano), entao sao isolaveis com Mockito puro.
 */
@ExtendWith(MockitoExtension.class)
class PostServiceMockitoTest {

  @Mock
  private UserPostReactionRepository reactionRepository;

  @InjectMocks
  private PostService postService;

  @Test
  @DisplayName("dado reacao inexistente, quando toggleLike, entao cria like e retorna true")
  void dadoReacaoInexistente_quandoToggleLike_entaoCriaLikeERetornaTrue() {
    when(reactionRepository.findByUserIdAndPostId(1L, 100L)).thenReturn(Optional.empty());

    Map<String, Object> resultado = postService.toggleLike(100L, 1L);

    assertEquals(100L, resultado.get("postId"));
    assertEquals(true, resultado.get("liked"));
    verify(reactionRepository, times(1)).save(any(UserPostReaction.class));
  }

  @Test
  @DisplayName("dado reacao existente, quando toggleLike, entao remove like e retorna false")
  void dadoReacaoExistente_quandoToggleLike_entaoRemoveLikeERetornaFalse() {
    UserPostReaction existente = new UserPostReaction();
    existente.setId(5L);
    existente.setUserId(1L);
    existente.setPostId(100L);
    when(reactionRepository.findByUserIdAndPostId(1L, 100L)).thenReturn(Optional.of(existente));

    Map<String, Object> resultado = postService.toggleLike(100L, 1L);

    assertEquals(100L, resultado.get("postId"));
    assertEquals(false, resultado.get("liked"));
    verify(reactionRepository, times(1)).delete(existente);
  }

  @Test
  @DisplayName("dado usuario sem reacoes, quando getLikedPosts, entao retorna lista vazia sem chamar API externa")
  void dadoUsuarioSemReacoes_quandoGetLikedPosts_entaoRetornaListaVaziaSemChamarApiExterna() {
    when(reactionRepository.findByUserId(anyLong())).thenReturn(List.of());

    Map<String, Object> resultado = postService.getLikedPosts(1L, 5, 0);

    assertEquals(0, resultado.get("total"));
    assertTrue(((List<?>) resultado.get("posts")).isEmpty());
  }

  @Test
  @DisplayName("dado skip negativo, quando getLikedPosts, entao deveria tratar como invalido em vez de lancar excecao (BUG: subList com indice negativo explode)")
  void dadoSkipNegativo_quandoGetLikedPosts_entaoDeveriaTratarComoInvalidoEmVezDeLancarExcecao() {
    UserPostReaction reacao = new UserPostReaction();
    reacao.setUserId(1L);
    reacao.setPostId(100L);
    when(reactionRepository.findByUserId(1L)).thenReturn(List.of(reacao));

    // Espera-se que skip negativo seja tratado de forma graciosa (ex: paginacao vazia),
    // mas List.subList(-1, ...) lanca IndexOutOfBoundsException, capturada e relancada
    // como RuntimeException("Erro ao buscar posts curtidos: ...") pelo proprio servico.
    assertDoesNotThrow(() -> postService.getLikedPosts(1L, 5, -1),
        "Esperado tratamento gracioso para skip negativo, mas o servico lanca RuntimeException (IndexOutOfBoundsException)");
  }
}
