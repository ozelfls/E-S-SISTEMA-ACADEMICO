package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.domain.Aluno;
import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.domain.Professor;
import br.edu.ghflusao.domain.Prova;
import br.edu.ghflusao.domain.ResultadoProva;
import br.edu.ghflusao.domain.Turma;

import java.time.LocalDate;
import java.util.List;

public record ProvaLancamentoDTO(
        ProvaResumo prova,
        TurmaResumo turma,
        List<ResultadoResumo> resultados
) {

    public static ProvaLancamentoDTO from(Prova prova, List<ResultadoProva> resultados) {
        return new ProvaLancamentoDTO(
                ProvaResumo.from(prova),
                TurmaResumo.from(prova.getTurma()),
                resultados.stream().map(ResultadoResumo::from).toList()
        );
    }

    public record ProvaResumo(
            Long id,
            String codigo,
            Double peso,
            String conteudo
    ) {
        public static ProvaResumo from(Prova prova) {
            return new ProvaResumo(
                    prova.getId(),
                    prova.getCodigo(),
                    prova.getPeso(),
                    prova.getConteudo()
            );
        }
    }

    public record TurmaResumo(
            Long id,
            String codigo,
            String semestre,
            Integer ano,
            String turno,
            DisciplinaResumo disciplina,
            CursoResumo curso,
            ProfessorResumo professor
    ) {
        public static TurmaResumo from(Turma turma) {
            Disciplina disciplina = turma.getDisciplina();
            return new TurmaResumo(
                    turma.getId(),
                    turma.getCodigo(),
                    turma.getSemestre(),
                    turma.getAno(),
                    turma.getTurno() != null ? turma.getTurno().name() : null,
                    DisciplinaResumo.from(disciplina),
                    disciplina != null ? CursoResumo.from(disciplina.getCurso()) : null,
                    ProfessorResumo.from(turma.getProfessor())
            );
        }
    }

    public record DisciplinaResumo(Long id, String codigo, String nome) {
        public static DisciplinaResumo from(Disciplina disciplina) {
            if (disciplina == null) {
                return null;
            }
            return new DisciplinaResumo(disciplina.getId(), disciplina.getCodigo(), disciplina.getNome());
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

    public record ProfessorResumo(Long id, String nome) {
        public static ProfessorResumo from(Professor professor) {
            if (professor == null) {
                return null;
            }
            return new ProfessorResumo(professor.getId(), professor.getNome());
        }
    }

    public record ResultadoResumo(
            Long id,
            Double nota,
            Boolean presente,
            LocalDate dataRealizacao,
            Integer duracaoMin,
            AlunoResumo aluno,
            Long matriculaId
    ) {
        public static ResultadoResumo from(ResultadoProva resultado) {
            Aluno aluno = resultado.getMatricula().getAluno();
            return new ResultadoResumo(
                    resultado.getId(),
                    resultado.getNota(),
                    resultado.getPresente(),
                    resultado.getDataRealizacao(),
                    resultado.getDuracaoMin(),
                    AlunoResumo.from(aluno),
                    resultado.getMatricula().getId()
            );
        }
    }

    public record AlunoResumo(
            Long id,
            String nome,
            Integer matriculaId,
            CursoResumo curso
    ) {
        public static AlunoResumo from(Aluno aluno) {
            return new AlunoResumo(
                    aluno.getId(),
                    aluno.getNome(),
                    aluno.getMatriculaId(),
                    CursoResumo.from(aluno.getCurso())
            );
        }
    }
}
