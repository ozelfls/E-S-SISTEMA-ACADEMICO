package br.edu.ghflusao.dto.request;

import br.edu.ghflusao.enums.Turno;
import br.edu.ghflusao.enums.StatusTurma;
import jakarta.validation.constraints.NotNull;

public record TurmaRequestDTO(
        String codigo,
        String horario,
        @NotNull Integer vagas,
        @NotNull String semestre,
        @NotNull Integer ano,
        @NotNull Turno turno,
        String sala,
        Long professorId,
        Long disciplinaId,
        StatusTurma status
) {
}
