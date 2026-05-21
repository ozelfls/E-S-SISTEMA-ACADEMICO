package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Prova;
import br.edu.ghflusao.domain.ResultadoProva;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.domain.AuditoriaResultado;
import br.edu.ghflusao.domain.UsuarioSistema;
import br.edu.ghflusao.dto.request.ProvaRequestDTO;
import br.edu.ghflusao.dto.request.ResultadoRequestDTO;
import br.edu.ghflusao.dto.response.AuditoriaResultadoDTO;
import br.edu.ghflusao.dto.response.ProvaLancamentoDTO;
import br.edu.ghflusao.enums.StatusTurma;
import br.edu.ghflusao.enums.Situacao;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.exception.ResourceNotFoundException;
import br.edu.ghflusao.repository.AuditoriaResultadoRepository;
import br.edu.ghflusao.repository.MatriculaEmTurmaRepository;
import br.edu.ghflusao.repository.ProvaRepository;
import br.edu.ghflusao.repository.ResultadoProvaRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import br.edu.ghflusao.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Objects;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

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
    private final AuditoriaResultadoRepository auditoriaResultadoRepo;
    private final UsuarioSistemaRepository usuarioSistemaRepo;

    public Prova cadastrarProva(Long turmaId, ProvaRequestDTO dto) {
        long startedAt = System.nanoTime();
        Turma turma = buscarTurmaAberta(turmaId);
        String codigo = resolverCodigo(dto.codigo(), new HashSet<>());
        validarCodigoLivre(codigo);
        List<Long> matriculasAtivas = matriculaRepo.findIdsByTurmaIdAndSituacao(turmaId, Situacao.ATIVA);
        Prova criada = criarProva(turma, codigo, dto, matriculasAtivas);
        log.info("Fluxo de prova concluido: turmaId={}, provaId={}, codigo={}, resultados={}, tempoMs={}",
                turmaId, criada.getId(), criada.getCodigo(), matriculasAtivas.size(), elapsedMs(startedAt));
        return criada;
    }

    public List<Prova> cadastrarProvas(Long turmaId, List<ProvaRequestDTO> dtos) {
        long startedAt = System.nanoTime();
        Turma turma = buscarTurmaAberta(turmaId);
        if (dtos == null || dtos.isEmpty()) {
            throw new BusinessException("Informe ao menos uma prova.");
        }

        Set<String> codigos = new HashSet<>();
        Set<String> codigosGerados = new HashSet<>();
        List<ProvaComCodigo> provas = dtos.stream()
                .map(dto -> new ProvaComCodigo(dto, resolverCodigo(dto.codigo(), codigosGerados)))
                .toList();
        for (ProvaComCodigo prova : provas) {
            validarCodigoConsulta(prova.codigo());
            if (!codigos.add(prova.codigo().toLowerCase(Locale.ROOT))) {
                throw new BusinessException("Codigo duplicado no lote: " + prova.codigo());
            }
        }
        List<String> codigosExistentes = provaRepo.findCodigosExistentes(
                provas.stream().map(ProvaComCodigo::codigo).toList()
        );
        if (!codigosExistentes.isEmpty()) {
            throw new BusinessException("Ja existe prova com o codigo " + codigosExistentes.get(0) + ".");
        }

        List<Long> matriculasAtivas = matriculaRepo.findIdsByTurmaIdAndSituacao(turmaId, Situacao.ATIVA);
        List<Prova> criadas = provas.stream()
                .map(prova -> criarProva(turma, prova.codigo(), prova.dto(), matriculasAtivas))
                .toList();
        log.info("Fluxo de provas em lote concluido: turmaId={}, provas={}, resultadosPorProva={}, tempoMs={}",
                turmaId, criadas.size(), matriculasAtivas.size(), elapsedMs(startedAt));
        return criadas;
    }

    @Transactional(readOnly = true)
    public ProvaLancamentoDTO buscarParaLancamento(String codigo) {
        long startedAt = System.nanoTime();
        String normalizado = normalizarCodigo(codigo);
        validarCodigoConsulta(normalizado);
        Prova prova = provaRepo.findByCodigoForLancamento(normalizado)
                .orElseThrow(() -> new ResourceNotFoundException("Prova nao encontrada: " + normalizado));
        List<ResultadoProva> resultados = resultadoRepo.findByProvaIdForLancamento(prova.getId());
        log.info("Prova carregada para lancamento: codigo={}, provaId={}, resultados={}, tempoMs={}",
                normalizado, prova.getId(), resultados.size(), elapsedMs(startedAt));
        return ProvaLancamentoDTO.from(prova, resultados);
    }

    public ResultadoProva lancarResultado(Long resultadoId, ResultadoRequestDTO dto) {
        long startedAt = System.nanoTime();
        ResultadoProva r = resultadoRepo.findByIdForLancamento(resultadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado nao encontrado."));
        Turma turma = r.getProva().getTurma();
        if (turma.getStatus() == StatusTurma.CLOSED) {
            throw new BusinessException("Turma fechada nao permite alteracao de notas ou presenca.");
        }

        if (dto.nota() < 0 || dto.nota() > 10) {
            throw new BusinessException("Nota deve estar entre 0 e 10.");
        }
        if (dto.data() != null && dto.data().isAfter(LocalDate.now())) {
            throw new BusinessException("Data de realizacao nao pode estar no futuro.");
        }
        if (Boolean.FALSE.equals(dto.presente()) && dto.nota() != null && dto.nota() > 0) {
            throw new BusinessException("Aluno ausente nao pode receber nota maior que zero.");
        }
        if (dto.duracao() != null && (dto.duracao() < 1 || dto.duracao() > 600)) {
            throw new BusinessException("Duracao deve ficar entre 1 e 600 minutos.");
        }

        boolean mudou = !Objects.equals(r.getNota(), dto.nota())
                || !Objects.equals(r.getPresente(), dto.presente())
                || !Objects.equals(r.getDataRealizacao(), dto.data())
                || !Objects.equals(r.getDuracaoMin(), dto.duracao());
        boolean lancamentoInicial = r.getNota() == null
                && r.getDataRealizacao() == null
                && r.getDuracaoMin() == null
                && !Boolean.TRUE.equals(r.getPresente());
        if (mudou && !lancamentoInicial && (dto.motivoAlteracao() == null || dto.motivoAlteracao().isBlank())) {
            throw new BusinessException("Informe o motivo da alteracao da nota.");
        }

        Double notaAnterior = r.getNota();
        Boolean presenteAnterior = r.getPresente();
        LocalDate dataAnterior = r.getDataRealizacao();
        Integer duracaoAnterior = r.getDuracaoMin();

        r.setNota(dto.nota());
        r.setPresente(dto.presente());
        r.setDataRealizacao(dto.data());
        r.setDuracaoMin(dto.duracao());
        ResultadoProva salvo = resultadoRepo.save(r);
        if (mudou) {
            registrarAuditoria(salvo, notaAnterior, presenteAnterior, dataAnterior, duracaoAnterior, dto);
        }
        academicPerformanceService.recalcularIndicadores(salvo.getMatricula());
        matriculaRepo.save(salvo.getMatricula());
        log.info("Resultado atualizado: resultadoId={}, matriculaId={}, provaId={}, mudou={}, tempoMs={}",
                salvo.getId(), salvo.getMatricula().getId(), salvo.getProva().getId(), mudou, elapsedMs(startedAt));
        return salvo;
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResultadoDTO> listarAuditoriaResultado(Long resultadoId) {
        if (!resultadoRepo.existsById(resultadoId)) {
            throw new ResourceNotFoundException("Resultado nao encontrado.");
        }
        return auditoriaResultadoRepo.findByResultadoIdOrderByAlteradoEmDesc(resultadoId)
                .stream()
                .map(AuditoriaResultadoDTO::from)
                .toList();
    }

    private void registrarAuditoria(
            ResultadoProva resultado,
            Double notaAnterior,
            Boolean presenteAnterior,
            LocalDate dataAnterior,
            Integer duracaoAnterior,
            ResultadoRequestDTO dto
    ) {
        UsuarioSistema usuario = usuarioAtual();
        AuditoriaResultado auditoria = new AuditoriaResultado();
        auditoria.setResultado(resultado);
        auditoria.setProvaId(resultado.getProva().getId());
        auditoria.setTurmaId(resultado.getProva().getTurma().getId());
        auditoria.setMatriculaId(resultado.getMatricula().getId());
        auditoria.setAlunoId(resultado.getMatricula().getAluno().getId());
        auditoria.setNotaAnterior(notaAnterior);
        auditoria.setNotaNova(dto.nota());
        auditoria.setPresenteAnterior(presenteAnterior);
        auditoria.setPresenteNovo(dto.presente());
        auditoria.setDataAnterior(dataAnterior);
        auditoria.setDataNova(dto.data());
        auditoria.setDuracaoAnterior(duracaoAnterior);
        auditoria.setDuracaoNova(dto.duracao());
        auditoria.setUsuarioId(usuario != null ? usuario.getId() : null);
        auditoria.setUsuarioLogin(usuario != null ? usuario.getLogin() : "sistema");
        auditoria.setUsuarioPerfil(usuario != null ? usuario.getPerfil() : null);
        auditoria.setMotivo(dto.motivoAlteracao() != null && !dto.motivoAlteracao().isBlank()
                ? dto.motivoAlteracao().trim()
                : "Lancamento inicial");
        auditoria.setAlteradoEm(LocalDateTime.now());
        auditoriaResultadoRepo.save(auditoria);
    }

    private UsuarioSistema usuarioAtual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UsuarioSistema usuario) {
            return usuario;
        }
        return usuarioSistemaRepo.findByLogin(auth.getName()).orElse(null);
    }

    private Turma buscarTurmaAberta(Long turmaId) {
        Turma turma = turmaRepo.findByIdAndAtivoTrue(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma nao encontrada: " + turmaId));
        if (turma.getStatus() == StatusTurma.CLOSED) {
            throw new BusinessException("Turma fechada nao permite cadastro de novas provas.");
        }
        return turma;
    }

    private Prova criarProva(Turma turma, String codigo, ProvaRequestDTO dto, List<Long> matriculasAtivas) {
        Prova prova = new Prova();
        prova.setCodigo(codigo);
        prova.setPeso(dto.peso());
        prova.setConteudo(dto.conteudo() != null && !dto.conteudo().isBlank() ? dto.conteudo().trim() : null);
        prova.setTurma(turma);
        provaRepo.save(prova);

        List<ResultadoProva> resultados = new ArrayList<>(matriculasAtivas.size());
        for (Long matriculaId : matriculasAtivas) {
            ResultadoProva r = new ResultadoProva();
            r.setMatricula(matriculaRepo.getReferenceById(matriculaId));
            r.setProva(prova);
            r.setPresente(false);
            resultados.add(r);
        }
        resultadoRepo.saveAll(resultados);
        log.info("Prova cadastrada: turmaId={}, provaId={}, codigo={}, totalResultados={}",
                turma.getId(), prova.getId(), prova.getCodigo(), resultados.size());
        return prova;
    }

    private void validarCodigoLivre(String codigo) {
        String normalizado = normalizarCodigo(codigo);
        validarCodigoConsulta(normalizado);
        if (provaRepo.existsByCodigo(normalizado)) {
            throw new BusinessException("Ja existe uma prova com o codigo " + normalizado + ".");
        }
    }

    private String resolverCodigo(String codigo, Set<String> reservados) {
        String normalizado = normalizarCodigo(codigo);
        if (!normalizado.isBlank()) {
            return normalizado;
        }

        for (int tentativa = 0; tentativa < 50; tentativa++) {
            String gerado = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
            String chave = gerado.toLowerCase(Locale.ROOT);
            if (!reservados.contains(chave) && !provaRepo.existsByCodigo(gerado)) {
                reservados.add(chave);
                return gerado;
            }
        }
        throw new BusinessException("Nao foi possivel gerar um codigo de prova. Tente novamente.");
    }

    private String normalizarCodigo(String codigo) {
        return codigo == null ? "" : codigo.trim();
    }

    private void validarCodigoConsulta(String codigo) {
        if (codigo == null || !codigo.matches("\\d{6}")) {
            throw new BusinessException("Informe o ID da prova com 6 digitos.");
        }
    }

    private long elapsedMs(long startedAt) {
        return (System.nanoTime() - startedAt) / 1_000_000;
    }

    private record ProvaComCodigo(ProvaRequestDTO dto, String codigo) {
    }
}
