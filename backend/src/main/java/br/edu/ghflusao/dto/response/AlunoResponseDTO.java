package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.enums.Turno;

public record AlunoResponseDTO(
        Long id,
        String nome,
        String cpf,
        Integer matriculaId,
        Turno turno,
        Long cursoId,
        String cursoNome,
        String email
) {
}
