package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Aluno;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.dto.response.MatriculaAutomaticaDTO;
import br.edu.ghflusao.dto.response.MatriculaOpcaoDTO;
import br.edu.ghflusao.dto.response.MatriculaWorkflowDTO;
import br.edu.ghflusao.dto.response.TurmaResponseDTO;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

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
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado: " + alunoId));

        Turma turma = turmaRepo.findByIdAndAtivoTrue(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma nao encontrada: " + turmaId));

        MatriculaWorkflowDTO analise = analisar(aluno, turma);
        if (!analise.podeMatricular()) {
            throw new BusinessException(analise.resumo());
        }

        MatriculaEmTurma matriculaSalva = criarMatricula(aluno, turma, false);
        log.info("Matricula criada: alunoId={}, turmaId={}, matriculaId={}", alunoId, turmaId, matriculaSalva.getId());
        return matriculaSalva;
    }

    public MatriculaAutomaticaDTO alocarAutomaticamente(Long alunoId) {
        Aluno aluno = alunoRepo.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado: " + alunoId));

        Long cursoId = aluno.getCurso() != null ? aluno.getCurso().getId() : null;
        List<Turma> candidatas = turmaRepo.findCandidatasAlocacaoAutomatica(cursoId, aluno.getTurno());
        if (candidatas.isEmpty()) {
            return new MatriculaAutomaticaDTO(
                    0,
                    0,
                    0,
                    "Nenhuma turma aberta com vaga foi encontrada para este aluno.",
                    List.of(),
                    List.of()
            );
        }

        Integer anoReferencia = candidatas.get(0).getAno();
        String semestreReferencia = candidatas.get(0).getSemestre();
        List<Turma> periodoAtual = candidatas.stream()
                .filter(t -> Objects.equals(t.getAno(), anoReferencia))
                .filter(t -> Objects.equals(t.getSemestre(), semestreReferencia))
                .toList();

        List<MatriculaAutomaticaDTO.Item> alocadas = new ArrayList<>();
        List<MatriculaAutomaticaDTO.Item> ignoradas = new ArrayList<>();

        for (Turma turma : periodoAtual) {
            MatriculaWorkflowDTO analise = analisar(aluno, turma);
            if (analise.podeMatricular()) {
                criarMatricula(aluno, turma, true);
                alocadas.add(item(turma, "Matricula criada."));
            } else {
                ignoradas.add(item(turma, primeiroBloqueio(analise)));
            }
        }

        String resumo = alocadas.isEmpty()
                ? "Nenhuma materia foi alocada automaticamente. Revise os bloqueios das turmas disponiveis."
                : alocadas.size() + " materia(s) alocada(s) automaticamente para " + semestreReferencia + "/" + anoReferencia + ".";

        log.info(
                "Alocacao automatica concluida: alunoId={}, avaliadas={}, alocadas={}, ignoradas={}",
                alunoId,
                periodoAtual.size(),
                alocadas.size(),
                ignoradas.size()
        );
        return new MatriculaAutomaticaDTO(
                alocadas.size(),
                periodoAtual.size(),
                ignoradas.size(),
                resumo,
                alocadas,
                ignoradas
        );
    }

    @Transactional(readOnly = true)
    public MatriculaWorkflowDTO analisarMatricula(Long alunoId, Long turmaId) {
        Aluno aluno = alunoRepo.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado: " + alunoId));
        Turma turma = turmaRepo.findByIdAndAtivoTrue(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma nao encontrada: " + turmaId));
        return analisar(aluno, turma);
    }

    @Transactional(readOnly = true)
    public List<MatriculaOpcaoDTO> listarOpcoesMatricula(Long alunoId) {
        Aluno aluno = alunoRepo.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno nao encontrado: " + alunoId));
        if (aluno.getCurso() == null) {
            return List.of();
        }
        return turmaRepo.findByCursoIdAndPeriodo(aluno.getCurso().getId(), null, null).stream()
                .map(turma -> {
                    MatriculaWorkflowDTO analise = analisar(aluno, turma);
                    return new MatriculaOpcaoDTO(
                            TurmaResponseDTO.from(turma),
                            analise,
                            analise.podeMatricular() ? null : primeiroBloqueio(analise)
                    );
                })
                .toList();
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

    private MatriculaWorkflowDTO analisar(Aluno aluno, Turma turma) {
        List<MatriculaWorkflowDTO.Etapa> etapas = new ArrayList<>();
        boolean bloqueado = false;
        Long alunoId = aluno.getId();
        Disciplina disc = turma.getDisciplina();

        boolean turmaAberta = turma.getStatus() != StatusTurma.CLOSED;
        etapas.add(etapa("turma", "Turma aberta", turmaAberta ? "Turma disponivel para matricula." : "Turma fechada para novas matriculas.", turmaAberta));
        bloqueado = bloqueado || !turmaAberta;

        boolean temVaga = turma.getVagas() != null && turma.getVagas() > 0;
        etapas.add(etapa("vaga", "Vaga disponivel", temVaga ? turma.getVagas() + " vaga(s) restante(s)." : "Turma sem vagas disponiveis.", temVaga));
        bloqueado = bloqueado || !temVaga;

        boolean jaNaTurma = matriculaRepo.existsByAlunoIdAndTurmaId(alunoId, turma.getId());
        etapas.add(etapa("duplicidade", "Matricula duplicada", jaNaTurma ? "Aluno ja esta vinculado a esta turma." : "Nenhuma matricula duplicada encontrada.", !jaNaTurma));
        bloqueado = bloqueado || jaNaTurma;

        if (disc != null) {
            boolean jaNaDisciplina = matriculaRepo.existsMatriculaAtivaNaDisciplina(alunoId, disc.getId());
            etapas.add(etapa("disciplina", "Disciplina em andamento", jaNaDisciplina ? "Aluno ja possui turma ativa nesta disciplina." : "Aluno nao possui outra turma ativa nesta disciplina.", !jaNaDisciplina));
            bloqueado = bloqueado || jaNaDisciplina;
        }

        if (disc != null && aluno.getCurso() != null && disc.getCurso() != null) {
            boolean mesmoCurso = aluno.getCurso().getId().equals(disc.getCurso().getId());
            etapas.add(etapa("curso", "Curso compativel", mesmoCurso ? "Disciplina pertence ao curso do aluno." : "Disciplina pertence a outro curso.", mesmoCurso));
            bloqueado = bloqueado || !mesmoCurso;
        }

        boolean horarioOk = true;
        if (turma.getHorario() != null && turma.getTurno() != null) {
            horarioOk = !matriculaRepo.existsHorarioConflitante(
                    alunoId,
                    turma.getSemestre(),
                    turma.getAno(),
                    turma.getTurno(),
                    turma.getHorario()
            );
        }
        etapas.add(etapa("horario", "Horario sem conflito", horarioOk ? "Nenhuma turma ativa no mesmo horario." : "Existe conflito com outra turma ativa.", horarioOk));
        bloqueado = bloqueado || !horarioOk;

        boolean prereqOk = true;
        String prereqDetalhe = "Disciplina sem pre-requisito.";
        if (disc != null && disc.getPreRequisito() != null) {
            prereqOk = matriculaRepo.existsByAlunoIdAndTurmaDisciplinaIdAndSituacao(alunoId, disc.getPreRequisito().getId(), Situacao.CONCLUIDA);
            prereqDetalhe = prereqOk
                    ? "Pre-requisito cumprido: " + disc.getPreRequisito().getCodigo()
                    : "Pre-requisito pendente: " + disc.getPreRequisito().getCodigo();
        }
        etapas.add(etapa("prerequisito", "Pre-requisito", prereqDetalhe, prereqOk));
        bloqueado = bloqueado || !prereqOk;

        String resumo = bloqueado
                ? "Matricula bloqueada. Revise os itens marcados antes de prosseguir."
                : "Tudo certo para matricular nesta turma.";
        return new MatriculaWorkflowDTO(!bloqueado, resumo, etapas);
    }

    private MatriculaWorkflowDTO.Etapa etapa(String chave, String titulo, String detalhe, boolean ok) {
        return new MatriculaWorkflowDTO.Etapa(chave, titulo, detalhe, ok ? "OK" : "BLOQUEADO");
    }

    private MatriculaEmTurma criarMatricula(Aluno aluno, Turma turma, boolean flush) {
        MatriculaEmTurma mat = new MatriculaEmTurma();
        mat.setAluno(aluno);
        mat.setTurma(turma);
        mat.setDtInscricao(LocalDate.now());
        mat.setSituacao(Situacao.ATIVA);
        mat.setFrequencia(0.0);

        turma.setVagas(turma.getVagas() - 1);
        turmaRepo.save(turma);

        return flush ? matriculaRepo.saveAndFlush(mat) : matriculaRepo.save(mat);
    }

    private MatriculaAutomaticaDTO.Item item(Turma turma, String motivo) {
        Disciplina disciplina = turma.getDisciplina();
        String nomeDisciplina = disciplina != null ? disciplina.getNome() : "-";
        return new MatriculaAutomaticaDTO.Item(turma.getId(), turma.getCodigo(), nomeDisciplina, motivo);
    }

    private String primeiroBloqueio(MatriculaWorkflowDTO analise) {
        return analise.etapas().stream()
                .filter(etapa -> !"OK".equals(etapa.status()))
                .map(MatriculaWorkflowDTO.Etapa::detalhe)
                .findFirst()
                .orElse(analise.resumo());
    }
}
