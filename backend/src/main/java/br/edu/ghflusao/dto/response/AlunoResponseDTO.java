package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.enums.Turno;

public record AlunoResponseDTO(
        Long id,
        String nome,
        Integer matriculaId,
        Turno turno,
        Long cursoId,
        String cursoNome,
        String email
) {
}
