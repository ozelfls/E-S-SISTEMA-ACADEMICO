package br.edu.ghflusao.repository;

import br.edu.ghflusao.domain.AuditoriaResultado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditoriaResultadoRepository extends JpaRepository<AuditoriaResultado, Long> {
    List<AuditoriaResultado> findByResultadoIdOrderByAlteradoEmDesc(Long resultadoId);
}
