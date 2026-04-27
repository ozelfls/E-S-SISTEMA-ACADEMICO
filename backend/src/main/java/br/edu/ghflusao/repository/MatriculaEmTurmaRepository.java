package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.enums.Situacao;
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

    List<MatriculaEmTurma> findByAlunoIdOrderByDtInscricaoDesc(Long alunoId);

    List<MatriculaEmTurma> findByAlunoIdAndSituacao(Long alunoId, Situacao situacao);

    List<MatriculaEmTurma> findByTurmaIdAndSituacao(Long turmaId, Situacao situacao);

    List<MatriculaEmTurma> findByTurmaId(Long turmaId);

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
