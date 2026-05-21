package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.ResultadoProva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResultadoProvaRepository extends JpaRepository<ResultadoProva, Long> {

    Optional<ResultadoProva> findByMatriculaIdAndProvaId(Long matriculaId, Long provaId);

    List<ResultadoProva> findByProvaId(Long provaId);

    @Query("""
            select r from ResultadoProva r
            join fetch r.prova p
            join fetch p.turma
            join fetch r.matricula m
            left join fetch m.aluno
            where r.id = :id
            """)
    Optional<ResultadoProva> findByIdForLancamento(@Param("id") Long id);

    @Query("""
            select r from ResultadoProva r
            join fetch r.matricula m
            join fetch m.aluno a
            left join fetch a.curso
            where r.prova.id = :provaId
            order by a.nome
            """)
    List<ResultadoProva> findByProvaIdForLancamento(@Param("provaId") Long provaId);

    @Query("""
            select r from ResultadoProva r
            join fetch r.matricula m
            join fetch r.prova p
            where p.turma.id = :turmaId
            """)
    List<ResultadoProva> findByTurmaIdForResumo(@Param("turmaId") Long turmaId);

    List<ResultadoProva> findByMatriculaId(Long matriculaId);

    List<ResultadoProva> findByProva_Turma_Id(Long turmaId);

    @Query("""
            select r from ResultadoProva r
            left join fetch r.matricula
            left join fetch r.prova
            """)
    List<ResultadoProva> findAllForRelatorioAcademico();
}
