package br.edu.ghflusao.dto.response;

public record MatriculaOpcaoDTO(
        TurmaResponseDTO turma,
        MatriculaWorkflowDTO analise,
        String motivoBloqueio
) {
}
