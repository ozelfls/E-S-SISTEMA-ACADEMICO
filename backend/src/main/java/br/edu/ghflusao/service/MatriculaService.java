package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Aluno;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.enums.StatusTurma;
import br.edu.ghflusao.enums.Situacao;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.exception.ResourceNotFoundException;
import br.edu.ghflusao.repository.AlunoRepository;
import br.edu.ghflusao.repository.MatriculaEmTurmaRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MatriculaService {

    private final AlunoRepository alunoRepo;
    private final TurmaRepository turmaRepo;
    private final MatriculaEmTurmaRepository matriculaRepo;

    public MatriculaEmTurma matricularAluno(Long alunoId, Long turmaId) {
        Aluno aluno = alunoRepo.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno não encontrado: " + alunoId));

        Turma turma = turmaRepo.findByIdAndAtivoTrue(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada: " + turmaId));

        if (turma.getStatus() == StatusTurma.CLOSED) {
            throw new BusinessException("Turma fechada para novas matrículas.");
        }

        if (turma.getVagas() <= 0) {
            throw new BusinessException("Turma sem vagas disponíveis.");
        }

        if (matriculaRepo.existsByAlunoIdAndTurmaId(alunoId, turmaId)) {
            throw new BusinessException("Aluno já matriculado nesta turma.");
        }

        if (turma.getHorario() != null && turma.getTurno() != null) {
            boolean conflitoHorario = matriculaRepo.existsHorarioConflitante(
                    alunoId,
                    turma.getSemestre(),
                    turma.getAno(),
                    turma.getTurno(),
                    turma.getHorario()
            );
            if (conflitoHorario) {
                throw new BusinessException("Conflito de horário com outra turma ativa.");
            }
        }

        Disciplina disc = turma.getDisciplina();
        if (disc != null && disc.getPreRequisito() != null) {
            boolean cumpriu = matriculaRepo
                    .existsByAlunoIdAndTurmaDisciplinaIdAndSituacao(alunoId, disc.getPreRequisito().getId(), Situacao.CONCLUIDA);
            if (!cumpriu) {
                throw new BusinessException("Pré-requisito não cumprido: " + disc.getPreRequisito().getCodigo());
            }
        }

        MatriculaEmTurma mat = new MatriculaEmTurma();
        mat.setAluno(aluno);
        mat.setTurma(turma);
        mat.setDtInscricao(LocalDate.now());
        mat.setSituacao(Situacao.ATIVA);
        mat.setFrequencia(0.0);

        turma.setVagas(turma.getVagas() - 1);
        turmaRepo.save(turma);

        MatriculaEmTurma matriculaSalva = matriculaRepo.save(mat);
        log.info("Matrícula criada: alunoId={}, turmaId={}, matriculaId={}", alunoId, turmaId, matriculaSalva.getId());
        return matriculaSalva;
    }

    @Transactional(readOnly = true)
    public List<MatriculaEmTurma> getHistorico(Long alunoId) {
        return matriculaRepo.findByAlunoIdOrderByDtInscricaoDesc(alunoId);
    }

    @Transactional(readOnly = true)
    public List<MatriculaEmTurma> getTurmasAtivas(Long alunoId) {
        return matriculaRepo.findByAlunoIdAndSituacao(alunoId, Situacao.ATIVA);
    }

    @Transactional(readOnly = true)
    public List<MatriculaEmTurma> getMatriculasPorTurma(Long turmaId) {
        return matriculaRepo.findByTurmaIdAndSituacao(turmaId, Situacao.ATIVA);
    }
}
