package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.domain.Professor;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.enums.Modalidade;
import br.edu.ghflusao.enums.StatusTurma;
import br.edu.ghflusao.enums.Turno;

public record TurmaResponseDTO(
        Long id,
        String codigo,
        String horario,
        Integer vagas,
        Integer cargaHoraria,
        String semestre,
        Integer ano,
        Turno turno,
        String sala,
        StatusTurma status,
        ProfessorResumo professor,
        DisciplinaResumo disciplina
) {

    public static TurmaResponseDTO from(Turma turma) {
        return new TurmaResponseDTO(
                turma.getId(),
                turma.getCodigo(),
                turma.getHorario(),
                turma.getVagas(),
                turma.getCargaHoraria(),
                turma.getSemestre(),
                turma.getAno(),
                turma.getTurno(),
                turma.getSala(),
                turma.getStatus(),
                ProfessorResumo.from(turma.getProfessor()),
                DisciplinaResumo.from(turma.getDisciplina())
        );
    }

    public record ProfessorResumo(
            Long id,
            String nome,
            String registro,
            String titulacao,
            String email,
            String regimeTrabalho
    ) {
        public static ProfessorResumo from(Professor professor) {
            if (professor == null) {
                return null;
            }
            return new ProfessorResumo(
                    professor.getId(),
                    professor.getNome(),
                    professor.getRegistro(),
                    professor.getTitulacao(),
                    professor.getEmail(),
                    professor.getRegimeTrabalho()
            );
        }
    }

    public record DisciplinaResumo(
            Long id,
            String codigo,
            String nome,
            Integer creditos,
            Integer ch,
            Modalidade modalidade,
            CursoResumo curso
    ) {
        public static DisciplinaResumo from(Disciplina disciplina) {
            if (disciplina == null) {
                return null;
            }
            return new DisciplinaResumo(
                    disciplina.getId(),
                    disciplina.getCodigo(),
                    disciplina.getNome(),
                    disciplina.getCreditos(),
                    disciplina.getCh(),
                    disciplina.getModalidade(),
                    CursoResumo.from(disciplina.getCurso())
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
