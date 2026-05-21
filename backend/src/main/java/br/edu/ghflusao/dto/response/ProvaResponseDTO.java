package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.domain.Prova;
import br.edu.ghflusao.domain.Turma;

public record ProvaResponseDTO(
        Long id,
        String codigo,
        Double peso,
        String conteudo,
        TurmaResumo turma
) {

    public static ProvaResponseDTO from(Prova prova) {
        return new ProvaResponseDTO(
                prova.getId(),
                prova.getCodigo(),
                prova.getPeso(),
                prova.getConteudo(),
                TurmaResumo.from(prova.getTurma())
        );
    }

    public record TurmaResumo(Long id, String codigo) {
        public static TurmaResumo from(Turma turma) {
            if (turma == null) {
                return null;
            }
            return new TurmaResumo(turma.getId(), turma.getCodigo());
        }
    }
}
