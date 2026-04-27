package br.edu.ghflusao.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProvaRequestDTO(
        @NotBlank String codigo,
        @NotNull @Positive Double peso,
        String conteudo
) {
}
