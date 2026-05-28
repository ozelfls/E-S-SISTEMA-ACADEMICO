package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.enums.Turno;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TurmaRepository extends JpaRepository<Turma, Long> {

    @EntityGraph(attributePaths = {"professor", "disciplina", "disciplina.curso"})
    Optional<Turma> findByIdAndAtivoTrue(Long id);

    @EntityGraph(attributePaths = {"professor", "disciplina", "disciplina.curso"})
    List<Turma> findByAtivoTrue();

    @EntityGraph(attributePaths = {"professor", "disciplina", "disciplina.curso"})
    List<Turma> findBySemestreAndAnoAndAtivoTrue(String semestre, Integer ano);

    @EntityGraph(attributePaths = {"professor", "disciplina", "disciplina.curso"})
    @Query("""
            select t
            from Turma t
            join t.disciplina d
            where t.ativo = true
              and d.curso.id = :cursoId
              and (:semestre is null or t.semestre = :semestre)
              and (:ano is null or t.ano = :ano)
            order by t.ano desc, t.semestre desc, d.codigo asc, t.codigo asc
            """)
    List<Turma> findByCursoIdAndPeriodo(
            @Param("cursoId") Long cursoId,
            @Param("semestre") String semestre,
            @Param("ano") Integer ano
    );

    @EntityGraph(attributePaths = {"professor", "disciplina", "disciplina.curso"})
    List<Turma> findByProfessorIdAndAtivoTrue(Long professorId);

    @EntityGraph(attributePaths = {"professor", "disciplina", "disciplina.curso"})
    List<Turma> findByDisciplinaIdAndAtivoTrue(Long disciplinaId);

    @EntityGraph(attributePaths = {"professor", "disciplina", "disciplina.curso", "disciplina.preRequisito"})
    @Query("""
            select t
            from Turma t
            join t.disciplina d
            where t.ativo = true
              and t.status <> br.edu.ghflusao.enums.StatusTurma.CLOSED
              and t.vagas > 0
              and (:cursoId is null or d.curso.id = :cursoId)
              and (:turno is null or t.turno = :turno or t.turno is null)
            order by t.ano desc, t.semestre desc, d.codigo asc, t.codigo asc
            """)
    List<Turma> findCandidatasAlocacaoAutomatica(
            @Param("cursoId") Long cursoId,
            @Param("turno") Turno turno
    );

    boolean existsByDisciplinaIdAndAtivoTrue(Long disciplinaId);

    boolean existsByProfessorIdAndAtivoTrue(Long professorId);

    boolean existsByProfessorId(Long professorId);

    boolean existsByCodigo(String codigo);

    @Query("""
            select count(t) > 0
            from Turma t
            where t.ativo = true
              and t.id <> :turmaId
              and t.semestre = :semestre
              and t.ano = :ano
              and t.turno = :turno
              and t.horario = :horario
              and t.professor.id = :professorId
            """)
    boolean existsProfessorConflict(
            @Param("turmaId") Long turmaId,
            @Param("semestre") String semestre,
            @Param("ano") Integer ano,
            @Param("turno") br.edu.ghflusao.enums.Turno turno,
            @Param("horario") String horario,
            @Param("professorId") Long professorId
    );

    @Query("""
            select t
            from Turma t
            where t.ativo = true and lower(t.codigo) like lower(concat('%', :codigo, '%'))
            """)
    List<Turma> findTop10ByCodigoContainingIgnoreCase(@Param("codigo") String codigo, org.springframework.data.domain.Pageable pageable);
}
