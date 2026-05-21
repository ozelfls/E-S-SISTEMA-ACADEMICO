package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Prova;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProvaRepository extends JpaRepository<Prova, Long> {

    List<Prova> findByTurmaId(Long turmaId);

    boolean existsByCodigo(String codigo);

    Optional<Prova> findByCodigo(String codigo);

    @Query("""
            select p.codigo
            from Prova p
            where p.codigo in :codigos
            """)
    List<String> findCodigosExistentes(@Param("codigos") Collection<String> codigos);

    @Query("""
            select p from Prova p
            join fetch p.turma t
            left join fetch t.disciplina d
            left join fetch d.curso
            left join fetch t.professor
            where p.codigo = :codigo
            """)
    Optional<Prova> findByCodigoForLancamento(@Param("codigo") String codigo);

    @Query("""
            select p from Prova p
            left join fetch p.turma
            """)
    List<Prova> findAllForRelatorioAcademico();

    long countByTurmaId(Long turmaId);
}
