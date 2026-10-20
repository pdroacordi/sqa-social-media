package com.demoapp.demo.mapper;

import org.springframework.stereotype.Component;

import com.demoapp.demo.dto.PostDTO;
import com.demoapp.demo.dto.ReactionsDTO;
import com.fasterxml.jackson.databind.JsonNode;

@Component
public class PostMapper {

  public PostDTO toPost(JsonNode postNode, boolean liked) {
    return new PostDTO(
        postNode.get("id").asLong(),
        postNode.get("title").asText(),
        postNode.get("body").asText(),
        liked,
        toReactions(postNode.path("reactions")));
  }

  private ReactionsDTO toReactions(JsonNode reactionsNode) {
    if (!reactionsNode.isObject()) {
      return ReactionsDTO.none();
    }

    return new ReactionsDTO(
        reactionsNode.path("likes").asInt(0),
        reactionsNode.path("dislikes").asInt(0));
  }

}
