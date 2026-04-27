package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Aluno;
import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.domain.Professor;
import br.edu.ghflusao.domain.Prova;
import br.edu.ghflusao.domain.ResultadoProva;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.AlunoBrief;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.AlunoBuscaItem;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.AlunoMatriculado;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.AlunoSlim;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.BuscarResponse;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.CursoBrief;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.CursoBuscaItem;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.CursoFull;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.DisciplinaBrief;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.DisciplinaBriefForMatricula;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.DisciplinaBuscaItem;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.DisciplinaFull;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.DisciplinaHistoricoResponse;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.DisciplinaSlim;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.MatriculaTrajetoria;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ProfessorBrief;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ProfessorBuscaItem;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ProfessorContato;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ProfessorLecionou;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ProfessorSlim;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ProfessorTurmasResponse;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ProvaResumo;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ProvaWithResultado;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.ResultadoBrief;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.SemestreResponse;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.TrajetoriaResponse;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.TurmaBrief;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.TurmaBuscaItem;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.TurmaDetalhe;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.TurmaDetalhesResponse;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.TurmaHistorico;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.TurmaSemestre;
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.TurmaWithCounts;
import br.edu.ghflusao.enums.Situacao;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.repository.AlunoRepository;
import br.edu.ghflusao.repository.CursoRepository;
import br.edu.ghflusao.repository.DisciplinaRepository;
import br.edu.ghflusao.repository.MatriculaEmTurmaRepository;
import br.edu.ghflusao.repository.ProfessorRepository;
import br.edu.ghflusao.repository.ProvaRepository;
import br.edu.ghflusao.repository.ResultadoProvaRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConsultaService {

    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final CursoRepository cursoRepository;
    private final TurmaRepository turmaRepository;
    private final MatriculaEmTurmaRepository matriculaRepository;
    private final ProvaRepository provaRepository;
    private final ResultadoProvaRepository resultadoRepository;

    public ProfessorTurmasResponse turmasDoProfessor(Long professorId) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        List<Turma> turmas = turmaRepository.findByProfessorIdAndAtivoTrue(professorId);

        List<TurmaWithCounts> items = turmas.stream().map(t -> {
            Disciplina d = t.getDisciplina();
            Curso c = d != null ? d.getCurso() : null;
            long totalAlunos = matriculaRepository.countByTurmaIdAndSituacao(t.getId(), Situacao.ATIVA);
            long totalProvas = provaRepository.countByTurmaId(t.getId());
            return new TurmaWithCounts(
                    t.getId(),
                    t.getCodigo(),
                    t.getSemestre(),
                    t.getAno(),
                    t.getTurno(),
                    t.getSala(),
                    t.getVagas(),
                    t.getHorario(),
                    d != null ? new DisciplinaBrief(d.getId(), d.getCodigo(), d.getNome(), d.getCreditos(), d.getCh(), d.getModalidade()) : null,
                    c != null ? new CursoBrief(c.getId(), c.getNome()) : null,
                    totalAlunos,
                    totalProvas
            );
        }).toList();

        ProfessorBrief pb = new ProfessorBrief(
                professor.getId(),
                professor.getNome(),
                professor.getEmail(),
                professor.getRegistro(),
                professor.getTitulacao()
        );
        return new ProfessorTurmasResponse(pb, items.size(), items);
    }

    public TrajetoriaResponse trajetoriaAluno(Long alunoId) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));

        List<MatriculaEmTurma> matriculas = matriculaRepository.findByAlunoIdOrderByDtInscricaoDesc(alunoId);

        int totalAtivas = 0;
        int totalConcluidas = 0;
        List<MatriculaTrajetoria> items = new ArrayList<>();

        for (MatriculaEmTurma m : matriculas) {
            if (m.getSituacao() == Situacao.ATIVA) totalAtivas++;
            if (m.getSituacao() == Situacao.CONCLUIDA) totalConcluidas++;

            Turma t = m.getTurma();
            Disciplina d = t != null ? t.getDisciplina() : null;
            Professor p = t != null ? t.getProfessor() : null;

            List<Prova> provas = t != null ? provaRepository.findByTurmaId(t.getId()) : List.of();
            List<ProvaWithResultado> provaItems = new ArrayList<>();
            double somaNotaPeso = 0.0;
            double somaPesos = 0.0;
            boolean temNota = false;

            for (Prova prova : provas) {
                ResultadoProva rp = resultadoRepository
                        .findByMatriculaIdAndProvaId(m.getId(), prova.getId())
                        .orElse(null);
                ResultadoBrief rbrief = rp != null
                        ? new ResultadoBrief(rp.getNota(), rp.getPresente(), rp.getDataRealizacao())
                        : null;
                provaItems.add(new ProvaWithResultado(
                        prova.getId(),
                        prova.getCodigo(),
                        prova.getPeso(),
                        prova.getConteudo(),
                        rbrief
                ));
                if (rp != null && rp.getNota() != null && prova.getPeso() != null) {
                    somaNotaPeso += rp.getNota() * prova.getPeso();
                    somaPesos += prova.getPeso();
                    temNota = true;
                }
            }

            Double mediaPonderada = m.getMediaFinal();
            if (mediaPonderada == null && temNota && somaPesos > 0) {
                mediaPonderada = round2(somaNotaPeso / somaPesos);
            }

            items.add(new MatriculaTrajetoria(
                    m.getId(),
                    m.getDtInscricao(),
                    m.getSituacao(),
                    m.getFrequencia(),
                    m.getObservacao(),
                    t != null ? new TurmaBrief(t.getId(), t.getCodigo(), t.getSemestre(), t.getAno(), t.getSala(), t.getHorario()) : null,
                    d != null ? new DisciplinaBriefForMatricula(d.getId(), d.getCodigo(), d.getNome(), d.getCreditos(), d.getCh()) : null,
                    p != null ? new ProfessorSlim(p.getId(), p.getNome()) : null,
                    provaItems,
                    mediaPonderada
            ));
        }

        Curso c = aluno.getCurso();
        AlunoBrief ab = new AlunoBrief(
                aluno.getId(),
                aluno.getNome(),
                aluno.getMatriculaId(),
                aluno.getCpf(),
                aluno.getEmail(),
                aluno.getTurno()
        );
        CursoFull cf = c != null
                ? new CursoFull(c.getId(), c.getNome(), c.getChTotal(), c.getPrevTerminoAnos())
                : null;

        return new TrajetoriaResponse(ab, cf, matriculas.size(), totalAtivas, totalConcluidas, items);
    }

    public TurmaDetalhesResponse detalhesTurma(Long turmaId) {
        Turma t = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        if (!t.isAtivo()) {
            throw new BusinessException("Entidade não encontrada.");
        }

        Disciplina d = t.getDisciplina();
        Curso c = d != null ? d.getCurso() : null;
        Professor p = t.getProfessor();

        List<MatriculaEmTurma> ativos = matriculaRepository.findByTurmaIdAndSituacao(turmaId, Situacao.ATIVA);
        List<Prova> provas = provaRepository.findByTurmaId(turmaId);

        List<AlunoMatriculado> alunos = ativos.stream().map(m -> {
            double somaNotaPeso = 0.0;
            double somaPesos = 0.0;
            boolean temNota = false;
            for (Prova prova : provas) {
                ResultadoProva rp = resultadoRepository
                        .findByMatriculaIdAndProvaId(m.getId(), prova.getId())
                        .orElse(null);
                if (rp != null && rp.getNota() != null && prova.getPeso() != null) {
                    somaNotaPeso += rp.getNota() * prova.getPeso();
                    somaPesos += prova.getPeso();
                    temNota = true;
                }
            }
            Double media = m.getMediaFinal();
            if (media == null && temNota && somaPesos > 0) {
                media = round2(somaNotaPeso / somaPesos);
            }
            Aluno a = m.getAluno();
            AlunoSlim aslim = a != null ? new AlunoSlim(a.getId(), a.getNome(), a.getMatriculaId()) : null;
            return new AlunoMatriculado(m.getId(), m.getSituacao(), m.getFrequencia(), aslim, media);
        }).toList();

        List<ProvaResumo> provaItems = provas.stream().map(prova -> {
            List<ResultadoProva> rs = resultadoRepository.findByProvaId(prova.getId());
            long total = rs.size();
            double soma = 0.0;
            int comNota = 0;
            for (ResultadoProva r : rs) {
                if (r.getNota() != null) {
                    soma += r.getNota();
                    comNota++;
                }
            }
            Double mediaProva = comNota > 0 ? round2(soma / comNota) : null;
            return new ProvaResumo(prova.getId(), prova.getCodigo(), prova.getPeso(), prova.getConteudo(), total, mediaProva);
        }).toList();

        TurmaDetalhe td = new TurmaDetalhe(
                t.getId(), t.getCodigo(), t.getSemestre(), t.getAno(),
                t.getTurno(), t.getSala(), t.getHorario(), t.getVagas()
        );
        DisciplinaBrief db = d != null
                ? new DisciplinaBrief(d.getId(), d.getCodigo(), d.getNome(), d.getCreditos(), d.getCh(), d.getModalidade())
                : null;
        CursoBrief cb = c != null ? new CursoBrief(c.getId(), c.getNome()) : null;
        ProfessorContato pc = p != null ? new ProfessorContato(p.getId(), p.getNome(), p.getEmail()) : null;
        long totalAlunos = alunos.size();
        long vagasRestantes = (t.getVagas() != null ? t.getVagas() : 0) - totalAlunos;

        return new TurmaDetalhesResponse(td, db, cb, pc, totalAlunos, vagasRestantes, alunos, provaItems);
    }

    public DisciplinaHistoricoResponse historicoDisciplina(Long disciplinaId) {
        Disciplina d = disciplinaRepository.findByIdAndAtivoTrue(disciplinaId)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));

        List<Turma> turmas = turmaRepository.findByDisciplinaIdAndAtivoTrue(disciplinaId);

        List<TurmaHistorico> turmaItems = new ArrayList<>();
        Map<Long, ProfessorLecionouAcc> profAcc = new LinkedHashMap<>();

        for (Turma t : turmas) {
            long totalAlunos = matriculaRepository.countByTurmaIdAndSituacao(t.getId(), Situacao.ATIVA);
            List<ResultadoProva> rs = resultadoRepository.findByProva_Turma_Id(t.getId());
            double soma = 0.0;
            int comNota = 0;
            for (ResultadoProva r : rs) {
                if (r.getNota() != null) {
                    soma += r.getNota();
                    comNota++;
                }
            }
            Double mediaTurma = comNota > 0 ? round2(soma / comNota) : null;

            Professor p = t.getProfessor();
            ProfessorSlim ps = p != null ? new ProfessorSlim(p.getId(), p.getNome()) : null;

            turmaItems.add(new TurmaHistorico(
                    t.getId(), t.getCodigo(), t.getSemestre(), t.getAno(), t.getVagas(),
                    ps, totalAlunos, mediaTurma
            ));

            if (p != null) {
                ProfessorLecionouAcc acc = profAcc.computeIfAbsent(p.getId(),
                        k -> new ProfessorLecionouAcc(p.getId(), p.getNome(), 0));
                acc.totalTurmas++;
            }
        }

        List<ProfessorLecionou> profs = profAcc.values().stream()
                .map(a -> new ProfessorLecionou(a.id, a.nome, a.totalTurmas))
                .toList();

        Curso c = d.getCurso();
        Disciplina pre = d.getPreRequisito();

        DisciplinaFull df = new DisciplinaFull(
                d.getId(), d.getCodigo(), d.getNome(),
                d.getCreditos(), d.getCh(), d.getModalidade(), d.getEmenta()
        );
        CursoBrief cb = c != null ? new CursoBrief(c.getId(), c.getNome()) : null;
        DisciplinaSlim preSlim = pre != null ? new DisciplinaSlim(pre.getId(), pre.getCodigo(), pre.getNome()) : null;

        return new DisciplinaHistoricoResponse(df, cb, preSlim, turmas.size(), turmaItems, profs);
    }

    public SemestreResponse snapshotSemestre(String semestre, Integer ano) {
        List<Turma> turmas = turmaRepository.findBySemestreAndAnoAndAtivoTrue(semestre, ano);
        long totalVagas = 0;
        long totalMatriculas = 0;
        Set<Long> profsAtivos = new HashSet<>();
        List<TurmaSemestre> items = new ArrayList<>();

        for (Turma t : turmas) {
            int vagas = t.getVagas() != null ? t.getVagas() : 0;
            totalVagas += vagas;

            long ocupadas = matriculaRepository.countByTurmaIdAndSituacao(t.getId(), Situacao.ATIVA);
            totalMatriculas += ocupadas;
            Double ocupacao = vagas > 0 ? round2((double) ocupadas / vagas) : 0.0;

            Disciplina d = t.getDisciplina();
            Professor p = t.getProfessor();
            if (p != null) profsAtivos.add(p.getId());

            DisciplinaSlim ds = d != null ? new DisciplinaSlim(d.getId(), d.getCodigo(), d.getNome()) : null;
            ProfessorSlim ps = p != null ? new ProfessorSlim(p.getId(), p.getNome()) : null;

            items.add(new TurmaSemestre(
                    t.getId(), t.getCodigo(), t.getSala(), t.getHorario(),
                    t.getVagas(), ocupadas, ocupacao, ds, ps
            ));
        }

        Double ocupacaoMedia = totalVagas > 0 ? round2((double) totalMatriculas / totalVagas) : 0.0;

        return new SemestreResponse(
                semestre, ano, turmas.size(),
                totalVagas, totalMatriculas, profsAtivos.size(),
                ocupacaoMedia, items
        );
    }

    public BuscarResponse buscar(String q) {
        if (q == null || q.trim().length() < 2) {
            throw new BusinessException("Digite ao menos 2 caracteres.");
        }
        String query = q.trim();

        List<Aluno> alunosNome = alunoRepository.findTop10ByNomeContainingIgnoreCase(query);
        List<Aluno> alunosMat = Collections.emptyList();
        try {
            Integer mid = Integer.valueOf(query);
            alunosMat = alunoRepository.findTop10ByMatriculaId(mid);
        } catch (NumberFormatException ignored) {
        }
        Map<Long, Aluno> alunosMap = new LinkedHashMap<>();
        for (Aluno a : alunosNome) alunosMap.putIfAbsent(a.getId(), a);
        for (Aluno a : alunosMat) alunosMap.putIfAbsent(a.getId(), a);
        List<AlunoBuscaItem> alunos = alunosMap.values().stream()
                .limit(10)
                .map(a -> new AlunoBuscaItem(
                        a.getId(), a.getNome(), a.getMatriculaId(),
                        a.getCurso() != null ? a.getCurso().getNome() : null
                ))
                .toList();

        List<Professor> professoresHits = professorRepository.searchTop10(query, PageRequest.of(0, 10));
        List<ProfessorBuscaItem> professores = professoresHits.stream()
                .map(p -> new ProfessorBuscaItem(p.getId(), p.getNome(), p.getEmail()))
                .toList();

        List<Disciplina> disciplinasHits = disciplinaRepository.searchTop10(query, PageRequest.of(0, 10));
        List<DisciplinaBuscaItem> disciplinas = disciplinasHits.stream()
                .map(d -> new DisciplinaBuscaItem(d.getId(), d.getCodigo(), d.getNome()))
                .toList();

        List<Turma> turmasHits = turmaRepository.findTop10ByCodigoContainingIgnoreCase(query, PageRequest.of(0, 10));
        List<TurmaBuscaItem> turmas = turmasHits.stream()
                .map(t -> new TurmaBuscaItem(
                        t.getId(), t.getCodigo(), t.getSemestre(), t.getAno(),
                        t.getDisciplina() != null ? t.getDisciplina().getNome() : null
                ))
                .toList();

        List<Curso> cursosHits = cursoRepository.findTop10ByNomeContainingIgnoreCase(query);
        List<CursoBuscaItem> cursos = cursosHits.stream()
                .map(c -> new CursoBuscaItem(c.getId(), c.getNome()))
                .toList();

        int total = alunos.size() + professores.size() + disciplinas.size() + turmas.size() + cursos.size();

        return new BuscarResponse(query, alunos, professores, disciplinas, turmas, cursos, total);
    }

    private Double round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private static final class ProfessorLecionouAcc {
        final Long id;
        final String nome;
        long totalTurmas;

        ProfessorLecionouAcc(Long id, String nome, long totalTurmas) {
            this.id = id;
            this.nome = nome;
            this.totalTurmas = totalTurmas;
        }
    }
}
