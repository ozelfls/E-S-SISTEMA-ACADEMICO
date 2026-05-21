package br.edu.ghflusao.dto.response;

import java.util.List;

public record MatriculaWorkflowDTO(
        boolean podeMatricular,
        String resumo,
        List<Etapa> etapas
) {
    public record Etapa(
            String chave,
            String titulo,
            String detalhe,
            String status
    ) {
    }
}
