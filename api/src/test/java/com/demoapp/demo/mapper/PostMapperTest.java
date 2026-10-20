package com.demoapp.demo.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.demoapp.demo.dto.PostDTO;
import com.demoapp.demo.dto.ReactionsDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class PostMapperTest {

  private final PostMapper mapper = new PostMapper();
  private final ObjectMapper objectMapper = new ObjectMapper();

  private JsonNode json(String content) throws Exception {
    return objectMapper.readTree(content);
  }

  @Test
  @DisplayName("dado post do DummyJSON com reactions, quando mapear, entao preserva likes e dislikes")
  void dadoPostComReactions_quandoMapear_entaoPreservaLikesEDislikes() throws Exception {
    JsonNode postNode = json("""
        {"id": 1, "title": "Titulo", "body": "Corpo", "reactions": {"likes": 192, "dislikes": 25}}
        """);

    PostDTO post = mapper.toPost(postNode, true);

    assertEquals(new PostDTO(1L, "Titulo", "Corpo", true, new ReactionsDTO(192, 25)), post);
  }

  @Test
  @DisplayName("dado post sem reactions, quando mapear, entao assume zero likes e zero dislikes")
  void dadoPostSemReactions_quandoMapear_entaoAssumeZeroLikesEZeroDislikes() throws Exception {
    JsonNode postNode = json("""
        {"id": 2, "title": "Titulo", "body": "Corpo"}
        """);

    PostDTO post = mapper.toPost(postNode, false);

    assertEquals(ReactionsDTO.none(), post.reactions());
  }

  @Test
  @DisplayName("dado reactions sem dislikes, quando mapear, entao assume zero apenas para o campo ausente")
  void dadoReactionsSemDislikes_quandoMapear_entaoAssumeZeroApenasParaOCampoAusente() throws Exception {
    JsonNode postNode = json("""
        {"id": 3, "title": "Titulo", "body": "Corpo", "reactions": {"likes": 7}}
        """);

    PostDTO post = mapper.toPost(postNode, false);

    assertEquals(new ReactionsDTO(7, 0), post.reactions());
  }

}
