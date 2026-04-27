package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {

    @Query("""
            select p from Professor p
            where lower(p.nome) like lower(concat('%', :q, '%'))
               or lower(p.email) like lower(concat('%', :q, '%'))
               or lower(p.registro) like lower(concat('%', :q, '%'))
            """)
    List<Professor> searchTop10(@Param("q") String q,
                                org.springframework.data.domain.Pageable pageable);
}
