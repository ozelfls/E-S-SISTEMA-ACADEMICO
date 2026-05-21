package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.domain.Aluno;
import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.enums.Situacao;
import br.edu.ghflusao.enums.Turno;

import java.time.LocalDate;

public record MatriculaEmTurmaResponseDTO(
        Long id,
        TurmaResponseDTO turma,
        AlunoResumo aluno,
        Situacao situacao,
        Double frequencia,
        LocalDate dtInscricao,
        Double mediaFinal
) {
    public static MatriculaEmTurmaResponseDTO from(MatriculaEmTurma matricula) {
        return new MatriculaEmTurmaResponseDTO(
                matricula.getId(),
                TurmaResponseDTO.from(matricula.getTurma()),
                AlunoResumo.from(matricula.getAluno()),
                matricula.getSituacao(),
                matricula.getFrequencia(),
                matricula.getDtInscricao(),
                matricula.getMediaFinal()
        );
    }

    public record AlunoResumo(
            Long id,
            String nome,
            Integer matriculaId,
            Turno turno,
            CursoResumo curso
    ) {
        public static AlunoResumo from(Aluno aluno) {
            if (aluno == null) {
                return null;
            }
            return new AlunoResumo(
                    aluno.getId(),
                    aluno.getNome(),
                    aluno.getMatriculaId(),
                    aluno.getTurno(),
                    CursoResumo.from(aluno.getCurso())
            );
        }
    }

    public record CursoResumo(Long id, String nome) {
        public static CursoResumo from(Curso curso) {
            if (curso == null) {
                return null;
            }
            return new CursoResumo(curso.getId(), curso.getNome());
        }
    }
}
