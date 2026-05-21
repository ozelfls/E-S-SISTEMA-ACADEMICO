package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.enums.Modalidade;

public record DisciplinaResponseDTO(
        Long id,
        String codigo,
        String nome,
        Integer creditos,
        Integer ch,
        String ementa,
        Modalidade modalidade,
        CursoResumo curso,
        PreRequisitoResumo preRequisito
) {

    public static DisciplinaResponseDTO from(Disciplina disciplina) {
        return new DisciplinaResponseDTO(
                disciplina.getId(),
                disciplina.getCodigo(),
                disciplina.getNome(),
                disciplina.getCreditos(),
                disciplina.getCh(),
                disciplina.getEmenta(),
                disciplina.getModalidade(),
                CursoResumo.from(disciplina.getCurso()),
                PreRequisitoResumo.from(disciplina.getPreRequisito())
        );
    }

    public record CursoResumo(Long id, String nome) {
        public static CursoResumo from(Curso curso) {
            if (curso == null) {
                return null;
            }
            return new CursoResumo(curso.getId(), curso.getNome());
        }
    }

    public record PreRequisitoResumo(Long id, String codigo, String nome) {
        public static PreRequisitoResumo from(Disciplina disciplina) {
            if (disciplina == null) {
                return null;
            }
            return new PreRequisitoResumo(
                    disciplina.getId(),
                    disciplina.getCodigo(),
                    disciplina.getNome()
            );
        }
    }
}
