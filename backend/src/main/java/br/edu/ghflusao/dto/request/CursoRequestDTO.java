package br.edu.ghflusao.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CursoRequestDTO(
        @NotBlank String nome,
        @NotNull Integer chTotal,
        @NotNull Integer prevTerminoAnos,
        @NotNull Integer limiteConclusao
) {
}
