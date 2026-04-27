package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.ResultadoProva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResultadoProvaRepository extends JpaRepository<ResultadoProva, Long> {

    Optional<ResultadoProva> findByMatriculaIdAndProvaId(Long matriculaId, Long provaId);

    List<ResultadoProva> findByProvaId(Long provaId);

    List<ResultadoProva> findByMatriculaId(Long matriculaId);

    List<ResultadoProva> findByProva_Turma_Id(Long turmaId);
}
