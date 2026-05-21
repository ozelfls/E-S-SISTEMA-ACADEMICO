package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.domain.Prova;
import br.edu.ghflusao.domain.ResultadoProva;
import br.edu.ghflusao.repository.ProvaRepository;
import br.edu.ghflusao.repository.ResultadoProvaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicPerformanceService {

    private final ResultadoProvaRepository resultadoRepository;
    private final ProvaRepository provaRepository;

    @Transactional
    public void recalcularIndicadores(MatriculaEmTurma matricula) {
        List<ResultadoProva> resultados = resultadoRepository.findByMatriculaId(matricula.getId());
        List<Prova> provasDaTurma = provaRepository.findByTurmaId(matricula.getTurma().getId());

        double totalComPeso = 0.0;
        double pesoTotal = 0.0;
        long presencas = 0L;

        for (ResultadoProva resultado : resultados) {
            if (Boolean.TRUE.equals(resultado.getPresente())) {
                presencas++;
            }

            if (resultado.getNota() != null && resultado.getProva() != null && resultado.getProva().getPeso() != null) {
                totalComPeso += resultado.getNota() * resultado.getProva().getPeso();
                pesoTotal += resultado.getProva().getPeso();
            }
        }

        double frequencia = provasDaTurma.isEmpty() ? 0.0 : (presencas * 100.0) / provasDaTurma.size();
        matricula.setFrequencia(round2(frequencia));

        if (pesoTotal > 0) {
            double mediaFinal = totalComPeso / pesoTotal;
            matricula.setMediaFinal(round2(mediaFinal));
        } else {
            matricula.setMediaFinal(null);
        }
    }

    private double round2(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
