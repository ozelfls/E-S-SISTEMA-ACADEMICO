package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findTop10ByNomeContainingIgnoreCase(String nome);
}
