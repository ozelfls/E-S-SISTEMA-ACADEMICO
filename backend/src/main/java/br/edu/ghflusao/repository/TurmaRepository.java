package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TurmaRepository extends JpaRepository<Turma, Long> {

    Optional<Turma> findByIdAndAtivoTrue(Long id);

    List<Turma> findByAtivoTrue();

    List<Turma> findBySemestreAndAnoAndAtivoTrue(String semestre, Integer ano);

    List<Turma> findByProfessorIdAndAtivoTrue(Long professorId);

    List<Turma> findByDisciplinaIdAndAtivoTrue(Long disciplinaId);

    boolean existsByDisciplinaIdAndAtivoTrue(Long disciplinaId);

    boolean existsByProfessorIdAndAtivoTrue(Long professorId);

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
