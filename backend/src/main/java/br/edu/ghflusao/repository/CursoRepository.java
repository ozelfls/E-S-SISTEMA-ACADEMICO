package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Curso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    @Override
    @EntityGraph(attributePaths = "coordenador")
    List<Curso> findAll();

    @Override
    @EntityGraph(attributePaths = "coordenador")
    Optional<Curso> findById(Long id);

    boolean existsByCoordenadorId(Long coordenadorId);

    List<Curso> findTop10ByNomeContainingIgnoreCase(String nome);
}
