package com.demoapp.demo.dto;

public record PostDTO(Long id, String title, String body, boolean liked, ReactionsDTO reactions) {
}
