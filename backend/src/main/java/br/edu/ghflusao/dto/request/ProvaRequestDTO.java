package br.edu.ghflusao.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProvaRequestDTO(
        @Size(max = 40) String codigo,
        @NotNull @Positive Double peso,
        String conteudo
) {
}
