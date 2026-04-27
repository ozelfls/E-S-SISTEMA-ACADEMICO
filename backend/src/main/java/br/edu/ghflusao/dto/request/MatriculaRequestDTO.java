package br.edu.ghflusao.dto.request;

import jakarta.validation.constraints.NotNull;

public record MatriculaRequestDTO(
        @NotNull Long turmaId
) {
}
