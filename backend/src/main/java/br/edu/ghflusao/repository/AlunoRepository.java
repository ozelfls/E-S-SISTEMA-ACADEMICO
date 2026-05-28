package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    List<Aluno> findTop10ByNomeContainingIgnoreCase(String nome);

    List<Aluno> findTop10ByMatriculaId(Integer matriculaId);

    @Query("select coalesce(max(a.matriculaId), 99999) from Aluno a where a.matriculaId between 100000 and 999999")
    Integer findMaiorMatriculaId();

    boolean existsByCursoId(Long cursoId);

    boolean existsByMatriculaId(Integer matriculaId);
}
