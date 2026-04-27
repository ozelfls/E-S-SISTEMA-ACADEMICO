package br.edu.ghflusao.dto.request;

import br.edu.ghflusao.enums.Modalidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DisciplinaRequestDTO(
        @NotBlank String codigo,
        @NotBlank String nome,
        @NotNull Integer creditos,
        @NotNull Integer ch,
        String ementa,
        @NotNull Modalidade modalidade,
        Long cursoId,
        Long preRequisitoId
) {
}
