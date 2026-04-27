package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Prova;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProvaRepository extends JpaRepository<Prova, Long> {

    List<Prova> findByTurmaId(Long turmaId);

    long countByTurmaId(Long turmaId);
}
