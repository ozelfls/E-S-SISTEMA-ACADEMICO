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
import br.edu.ghflusao.dto.response.consulta.ConsultaDTOs.RelatorioAcademicoRow;
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
import br.edu.ghflusao.enums.Modalidade;
import br.edu.ghflusao.enums.Situacao;
import br.edu.ghflusao.enums.Turno;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
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
    private final JdbcTemplate jdbc;

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

        List<MatriculaEmTurma> ativos = matriculaRepository.findByTurmaIdAndSituacaoWithAluno(turmaId, Situacao.ATIVA);
        List<Prova> provas = provaRepository.findByTurmaId(turmaId);
        List<ResultadoProva> resultadosTurma = resultadoRepository.findByTurmaIdForResumo(turmaId);
        Map<Long, List<ResultadoProva>> resultadosPorMatricula = new LinkedHashMap<>();
        Map<Long, List<ResultadoProva>> resultadosPorProva = new LinkedHashMap<>();
        for (ResultadoProva resultado : resultadosTurma) {
            resultadosPorMatricula
                    .computeIfAbsent(resultado.getMatricula().getId(), key -> new ArrayList<>())
                    .add(resultado);
            resultadosPorProva
                    .computeIfAbsent(resultado.getProva().getId(), key -> new ArrayList<>())
                    .add(resultado);
        }

        List<AlunoMatriculado> alunos = ativos.stream().map(m -> {
            double somaNotaPeso = 0.0;
            double somaPesos = 0.0;
            boolean temNota = false;
            for (ResultadoProva resultado : resultadosPorMatricula.getOrDefault(m.getId(), List.of())) {
                Prova prova = resultado.getProva();
                if (resultado.getNota() != null && prova.getPeso() != null) {
                    somaNotaPeso += resultado.getNota() * prova.getPeso();
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
            List<ResultadoProva> rs = resultadosPorProva.getOrDefault(prova.getId(), List.of());
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

    public List<RelatorioAcademicoRow> relatorioAcademico() {
        return jdbc.query("""
                select aluno_id, aluno_nome, aluno_matricula, aluno_email, aluno_turno,
                       curso_id, curso_nome, curso_ch_total,
                       disciplina_id, disciplina_codigo, disciplina_nome, disciplina_ch, disciplina_modalidade,
                       turma_id, turma_codigo, turma_turno, turma_semestre, turma_ano, turma_sala, turma_horario, turma_vagas,
                       professor_id, professor_nome, professor_email, professor_titulacao,
                       matricula_id, matricula_data, matricula_situacao, matricula_frequencia, matricula_media_final,
                       prova_id, prova_codigo, prova_peso, prova_conteudo,
                       resultado_id, resultado_nota, resultado_presente, resultado_data_realizacao, resultado_duracao_min
                  from relatorio_academico_cache
                 order by matricula_id desc, prova_id
                """, (rs, rowNum) -> new RelatorioAcademicoRow(
                nullableLong(rs, "aluno_id"),
                rs.getString("aluno_nome"),
                nullableInt(rs, "aluno_matricula"),
                rs.getString("aluno_email"),
                enumValue(Turno.class, rs.getString("aluno_turno")),
                nullableLong(rs, "curso_id"),
                rs.getString("curso_nome"),
                nullableInt(rs, "curso_ch_total"),
                nullableLong(rs, "disciplina_id"),
                rs.getString("disciplina_codigo"),
                rs.getString("disciplina_nome"),
                nullableInt(rs, "disciplina_ch"),
                enumValue(Modalidade.class, rs.getString("disciplina_modalidade")),
                nullableLong(rs, "turma_id"),
                rs.getString("turma_codigo"),
                enumValue(Turno.class, rs.getString("turma_turno")),
                rs.getString("turma_semestre"),
                nullableInt(rs, "turma_ano"),
                rs.getString("turma_sala"),
                rs.getString("turma_horario"),
                nullableInt(rs, "turma_vagas"),
                nullableLong(rs, "professor_id"),
                rs.getString("professor_nome"),
                rs.getString("professor_email"),
                rs.getString("professor_titulacao"),
                nullableLong(rs, "matricula_id"),
                nullableDate(rs, "matricula_data"),
                enumValue(Situacao.class, rs.getString("matricula_situacao")),
                nullableDouble(rs, "matricula_frequencia"),
                nullableDouble(rs, "matricula_media_final"),
                nullableLong(rs, "prova_id"),
                rs.getString("prova_codigo"),
                nullableDouble(rs, "prova_peso"),
                rs.getString("prova_conteudo"),
                nullableLong(rs, "resultado_id"),
                nullableDouble(rs, "resultado_nota"),
                nullableBoolean(rs, "resultado_presente"),
                nullableDate(rs, "resultado_data_realizacao"),
                nullableInt(rs, "resultado_duracao_min")
        ));
    }

    private static Long nullableLong(ResultSet rs, String column) throws SQLException {
        long value = rs.getLong(column);
        return rs.wasNull() ? null : value;
    }

    private static Integer nullableInt(ResultSet rs, String column) throws SQLException {
        int value = rs.getInt(column);
        return rs.wasNull() ? null : value;
    }

    private static Double nullableDouble(ResultSet rs, String column) throws SQLException {
        double value = rs.getDouble(column);
        return rs.wasNull() ? null : value;
    }

    private static Boolean nullableBoolean(ResultSet rs, String column) throws SQLException {
        int value = rs.getInt(column);
        return rs.wasNull() ? null : value == 1;
    }

    private static java.time.LocalDate nullableDate(ResultSet rs, String column) throws SQLException {
        Date value = rs.getDate(column);
        return value == null ? null : value.toLocalDate();
    }

    private static <E extends Enum<E>> E enumValue(Class<E> type, String value) {
        return value == null ? null : Enum.valueOf(type, value);
    }

    private RelatorioAcademicoRow relatorioRow(
            Aluno aluno,
            Curso curso,
            Disciplina disciplina,
            Turma turma,
            Professor professor,
            MatriculaEmTurma matricula,
            Prova prova,
            ResultadoProva resultado
    ) {
        return new RelatorioAcademicoRow(
                aluno != null ? aluno.getId() : null,
                aluno != null ? aluno.getNome() : null,
                aluno != null ? aluno.getMatriculaId() : null,
                aluno != null ? aluno.getEmail() : null,
                aluno != null ? aluno.getTurno() : null,
                curso != null ? curso.getId() : null,
                curso != null ? curso.getNome() : null,
                curso != null ? curso.getChTotal() : null,
                disciplina != null ? disciplina.getId() : null,
                disciplina != null ? disciplina.getCodigo() : null,
                disciplina != null ? disciplina.getNome() : null,
                disciplina != null ? disciplina.getCh() : null,
                disciplina != null ? disciplina.getModalidade() : null,
                turma != null ? turma.getId() : null,
                turma != null ? turma.getCodigo() : null,
                turma != null ? turma.getTurno() : null,
                turma != null ? turma.getSemestre() : null,
                turma != null ? turma.getAno() : null,
                turma != null ? turma.getSala() : null,
                turma != null ? turma.getHorario() : null,
                turma != null ? turma.getVagas() : null,
                professor != null ? professor.getId() : null,
                professor != null ? professor.getNome() : null,
                professor != null ? professor.getEmail() : null,
                professor != null ? professor.getTitulacao() : null,
                matricula != null ? matricula.getId() : null,
                matricula != null ? matricula.getDtInscricao() : null,
                matricula != null ? matricula.getSituacao() : null,
                matricula != null ? matricula.getFrequencia() : null,
                matricula != null ? matricula.getMediaFinal() : null,
                prova != null ? prova.getId() : null,
                prova != null ? prova.getCodigo() : null,
                prova != null ? prova.getPeso() : null,
                prova != null ? prova.getConteudo() : null,
                resultado != null ? resultado.getId() : null,
                resultado != null ? resultado.getNota() : null,
                resultado != null ? resultado.getPresente() : null,
                resultado != null ? resultado.getDataRealizacao() : null,
                resultado != null ? resultado.getDuracaoMin() : null
        );
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
