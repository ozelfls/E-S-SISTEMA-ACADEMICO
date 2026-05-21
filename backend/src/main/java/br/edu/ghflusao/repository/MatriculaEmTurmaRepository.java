package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.enums.Situacao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatriculaEmTurmaRepository extends JpaRepository<MatriculaEmTurma, Long> {
    boolean existsByAlunoIdAndTurmaId(Long alunoId, Long turmaId);

    @Query("""
            select count(m) > 0
            from MatriculaEmTurma m
            where m.aluno.id = :alunoId
              and m.turma.disciplina.id = :disciplinaId
              and m.situacao = :situacao
            """)
    boolean existsByAlunoIdAndTurmaDisciplinaIdAndSituacao(
            @Param("alunoId") Long alunoId,
            @Param("disciplinaId") Long disciplinaId,
            @Param("situacao") Situacao situacao
    );

    @Query("""
            select count(m) > 0
            from MatriculaEmTurma m
            where m.aluno.id = :alunoId
              and m.turma.disciplina.id = :disciplinaId
              and m.situacao = br.edu.ghflusao.enums.Situacao.ATIVA
            """)
    boolean existsMatriculaAtivaNaDisciplina(
            @Param("alunoId") Long alunoId,
            @Param("disciplinaId") Long disciplinaId
    );

    @EntityGraph(attributePaths = {"aluno", "aluno.curso", "turma", "turma.professor", "turma.disciplina", "turma.disciplina.curso"})
    List<MatriculaEmTurma> findByAlunoIdOrderByDtInscricaoDesc(Long alunoId);

    @EntityGraph(attributePaths = {"aluno", "aluno.curso", "turma", "turma.professor", "turma.disciplina", "turma.disciplina.curso"})
    List<MatriculaEmTurma> findByAlunoIdAndSituacao(Long alunoId, Situacao situacao);

    @EntityGraph(attributePaths = {"aluno", "aluno.curso", "turma", "turma.professor", "turma.disciplina", "turma.disciplina.curso"})
    List<MatriculaEmTurma> findByTurmaIdAndSituacao(Long turmaId, Situacao situacao);

    @Query("""
            select m.id
            from MatriculaEmTurma m
            where m.turma.id = :turmaId
              and m.situacao = :situacao
            order by m.id
            """)
    List<Long> findIdsByTurmaIdAndSituacao(
            @Param("turmaId") Long turmaId,
            @Param("situacao") Situacao situacao
    );

    @Query("""
            select m from MatriculaEmTurma m
            join fetch m.aluno a
            where m.turma.id = :turmaId
              and m.situacao = :situacao
            order by a.nome
            """)
    List<MatriculaEmTurma> findByTurmaIdAndSituacaoWithAluno(
            @Param("turmaId") Long turmaId,
            @Param("situacao") Situacao situacao
    );

    List<MatriculaEmTurma> findByTurmaId(Long turmaId);

    @Query("""
            select distinct m from MatriculaEmTurma m
            left join fetch m.aluno a
            left join fetch a.curso
            left join fetch m.turma t
            left join fetch t.professor
            left join fetch t.disciplina d
            left join fetch d.curso
            """)
    List<MatriculaEmTurma> findAllForRelatorioAcademico();

    long countByTurmaIdAndSituacao(Long turmaId, Situacao situacao);

    boolean existsByTurmaId(Long turmaId);

    @Query("""
            select count(m) > 0
            from MatriculaEmTurma m
            where m.aluno.id = :alunoId
              and m.situacao = br.edu.ghflusao.enums.Situacao.ATIVA
              and m.turma.ativo = true
              and m.turma.semestre = :semestre
              and m.turma.ano = :ano
              and m.turma.turno = :turno
              and m.turma.horario = :horario
            """)
    boolean existsHorarioConflitante(
            @Param("alunoId") Long alunoId,
            @Param("semestre") String semestre,
            @Param("ano") Integer ano,
            @Param("turno") br.edu.ghflusao.enums.Turno turno,
            @Param("horario") String horario
    );

    @Query("""
            select count(m) from MatriculaEmTurma m
            where m.turma.semestre = :semestre and m.turma.ano = :ano
            """)
    long countBySemestreAndAno(@Param("semestre") String semestre, @Param("ano") Integer ano);
}
