package com.demoapp.demo.dto;

public record ReactionsDTO(int likes, int dislikes) {

  public static ReactionsDTO none() {
    return new ReactionsDTO(0, 0);
  }

}
