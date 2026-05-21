package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Disciplina;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {
    @EntityGraph(attributePaths = {"curso", "preRequisito"})
    List<Disciplina> findByCursoIdAndAtivoTrue(Long cursoId);

    @EntityGraph(attributePaths = {"curso", "preRequisito"})
    List<Disciplina> findByAtivoTrue();

    @EntityGraph(attributePaths = {"curso", "preRequisito"})
    java.util.Optional<Disciplina> findByIdAndAtivoTrue(Long id);

    boolean existsByCursoIdAndAtivoTrue(Long cursoId);

    @Query("""
            select d from Disciplina d
            where d.ativo = true and (
                lower(d.codigo) like lower(concat('%', :q, '%'))
                or lower(d.nome) like lower(concat('%', :q, '%'))
            )
            """)
    List<Disciplina> searchTop10(@Param("q") String q,
                                 org.springframework.data.domain.Pageable pageable);
}
