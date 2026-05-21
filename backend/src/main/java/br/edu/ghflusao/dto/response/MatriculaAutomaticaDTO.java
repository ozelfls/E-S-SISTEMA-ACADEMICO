package br.edu.ghflusao.dto.response;

import java.util.List;

public record MatriculaAutomaticaDTO(
        int matriculasCriadas,
        int turmasAvaliadas,
        int turmasIgnoradas,
        String resumo,
        List<Item> alocadas,
        List<Item> ignoradas
) {
    public record Item(
            Long turmaId,
            String turmaCodigo,
            String disciplina,
            String motivo
    ) {
    }
}
