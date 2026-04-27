package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.domain.Prova;
import br.edu.ghflusao.domain.ResultadoProva;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.dto.request.ProvaRequestDTO;
import br.edu.ghflusao.dto.request.ResultadoRequestDTO;
import br.edu.ghflusao.enums.StatusTurma;
import br.edu.ghflusao.enums.Situacao;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.exception.ResourceNotFoundException;
import br.edu.ghflusao.repository.MatriculaEmTurmaRepository;
import br.edu.ghflusao.repository.ProvaRepository;
import br.edu.ghflusao.repository.ResultadoProvaRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProvaService {

    private final TurmaRepository turmaRepo;
    private final ProvaRepository provaRepo;
    private final MatriculaEmTurmaRepository matriculaRepo;
    private final ResultadoProvaRepository resultadoRepo;
    private final AcademicPerformanceService academicPerformanceService;

    public Prova cadastrarProva(Long turmaId, ProvaRequestDTO dto) {
        Turma turma = turmaRepo.findByIdAndAtivoTrue(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada: " + turmaId));
        if (turma.getStatus() == StatusTurma.CLOSED) {
            throw new BusinessException("Turma fechada não permite cadastro de novas provas.");
        }

        Prova prova = new Prova();
        prova.setCodigo(dto.codigo());
        prova.setPeso(dto.peso());
        prova.setConteudo(dto.conteudo());
        prova.setTurma(turma);
        provaRepo.save(prova);

        List<MatriculaEmTurma> ativos = matriculaRepo.findByTurmaIdAndSituacao(turmaId, Situacao.ATIVA);
        List<ResultadoProva> resultados = ativos.stream().map(mat -> {
            ResultadoProva r = new ResultadoProva();
            r.setMatricula(mat);
            r.setProva(prova);
            r.setPresente(false);
            return r;
        }).toList();
        resultadoRepo.saveAll(resultados);
        log.info("Prova cadastrada: turmaId={}, provaId={}, totalResultados={}", turmaId, prova.getId(), resultados.size());
        return prova;
    }

    public ResultadoProva lancarResultado(Long resultadoId, ResultadoRequestDTO dto) {
        ResultadoProva r = resultadoRepo.findById(resultadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado não encontrado."));
        Turma turma = r.getProva().getTurma();
        if (turma.getStatus() == StatusTurma.CLOSED) {
            throw new BusinessException("Turma fechada não permite alteração de notas ou presença.");
        }

        if (dto.nota() < 0 || dto.nota() > 10) {
            throw new BusinessException("Nota deve estar entre 0 e 10.");
        }

        r.setNota(dto.nota());
        r.setPresente(dto.presente());
        r.setDataRealizacao(dto.data());
        r.setDuracaoMin(dto.duracao());
        ResultadoProva salvo = resultadoRepo.save(r);
        academicPerformanceService.recalcularIndicadores(salvo.getMatricula());
        matriculaRepo.save(salvo.getMatricula());
        log.info("Resultado atualizado: resultadoId={}, matriculaId={}, provaId={}",
                salvo.getId(), salvo.getMatricula().getId(), salvo.getProva().getId());
        return salvo;
    }
}
