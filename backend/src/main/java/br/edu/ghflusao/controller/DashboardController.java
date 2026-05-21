package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','DIRETOR','SECRETARIA','COORDENADOR')")
public class DashboardController {

    private final JdbcTemplate jdbc;

    @GetMapping("/admin-resumo")
    public ApiResponse<AdminDashboardResumo> adminResumo() {
        Metricas metricas = jdbc.queryForObject("""
                select total_cursos, total_disciplinas, total_professores,
                       total_alunos, total_turmas, total_matriculas,
                       total_provas, total_resultados
                  from dashboard_metricas
                 where id = 1
                """, (rs, rowNum) -> new Metricas(
                rs.getLong("total_cursos"),
                rs.getLong("total_disciplinas"),
                rs.getLong("total_professores"),
                rs.getLong("total_alunos"),
                rs.getLong("total_turmas"),
                rs.getLong("total_matriculas"),
                rs.getLong("total_provas"),
                rs.getLong("total_resultados")
        ));

        AdminDashboardResumo resumo = new AdminDashboardResumo(
                metricas,
                longValue("select count(*) from turmas where professor_id is null and ativo = 1"),
                longValue("select count(*) from turmas where turno = 'NOITE' and ativo = 1"),
                longValue("select coalesce(sum(vagas), 0) from turmas where ativo = 1"),
                longValue("select count(*) from cursos where coordenador_id is null"),
                longValue("select count(*) from alunos where email is null"),
                chart("""
                        select c.nome as label, count(a.id) as value
                          from cursos c
                          left join alunos a on a.curso_id = c.id
                         group by c.nome
                         order by value desc
                         fetch first 8 rows only
                        """),
                chart("""
                        select coalesce(turno, 'Nao informado') as label, count(*) as value
                          from turmas
                         where ativo = 1
                         group by coalesce(turno, 'Nao informado')
                         order by value desc
                        """),
                chart("""
                        select coalesce(status, 'Sem status') as label, count(*) as value
                          from turmas
                         where ativo = 1
                         group by coalesce(status, 'Sem status')
                         order by value desc
                        """),
                chart("""
                        select c.nome as label, count(d.id) as value
                          from cursos c
                          left join disciplinas d on d.curso_id = c.id and d.ativo = 1
                         group by c.nome
                        order by value desc
                        fetch first 6 rows only
                        """),
                timeline(),
                alunosRisco(),
                pendenciasNotas(),
                ocupacaoTurmas(),
                auditoriasNotas()
        );

        return ApiResponse.ok(resumo);
    }

    private long longValue(String sql) {
        Long value = jdbc.queryForObject(sql, Long.class);
        return value == null ? 0L : value;
    }

    private List<ChartItem> chart(String sql) {
        return jdbc.query(sql, (rs, rowNum) -> new ChartItem(
                rs.getString("label"),
                rs.getLong("value")
        ));
    }

    private List<TimelineItem> timeline() {
        return jdbc.query("""
                select * from (
                    select 'Turma ' || codigo as title,
                           coalesce(turno, 'turno nao informado') || ' - ' || semestre || '/' || ano as detail,
                           '/admin/turmas?turma=' || codigo as href,
                           'primary' as tone,
                           id as sort_id
                      from turmas
                     where ativo = 1
                    union all
                    select nome as title,
                           'Aluno cadastrado' as detail,
                           '/admin/alunos?aluno=' || nome as href,
                           'success' as tone,
                           id as sort_id
                      from alunos
                    union all
                    select nome as title,
                           coalesce(email, 'Professor cadastrado') as detail,
                           '/admin/professores?professor=' || nome as href,
                           'warning' as tone,
                           id as sort_id
                      from professores
                )
                order by sort_id desc
                fetch first 7 rows only
                """, (rs, rowNum) -> new TimelineItem(
                rs.getString("title"),
                rs.getString("detail"),
                rs.getString("href"),
                rs.getString("tone")
        ));
    }

    private List<AlunoRiscoItem> alunosRisco() {
        return jdbc.query("""
                select * from (
                    select aluno_id, aluno_nome, aluno_matricula, curso_nome,
                           turma_codigo, disciplina_nome,
                           round(coalesce(max(matricula_media_final), avg(resultado_nota)), 2) as media,
                           max(matricula_frequencia) as frequencia
                      from relatorio_academico_cache
                     where matricula_situacao = 'ATIVA'
                     group by aluno_id, aluno_nome, aluno_matricula, curso_nome, turma_codigo, disciplina_nome, matricula_id
                    having coalesce(max(matricula_media_final), avg(resultado_nota), 0) < 6
                        or max(matricula_frequencia) < 75
                     order by media nulls first, frequencia nulls first
                )
                fetch first 8 rows only
                """, (rs, rowNum) -> new AlunoRiscoItem(
                rs.getLong("aluno_id"),
                rs.getString("aluno_nome"),
                rs.getInt("aluno_matricula"),
                rs.getString("curso_nome"),
                rs.getString("turma_codigo"),
                rs.getString("disciplina_nome"),
                rs.getObject("media") != null ? rs.getDouble("media") : null,
                rs.getObject("frequencia") != null ? rs.getDouble("frequencia") : null
        ));
    }

    private List<PendenciaNotaItem> pendenciasNotas() {
        return jdbc.query("""
                select * from (
                    select t.id as turma_id, t.codigo as turma_codigo, d.nome as disciplina_nome,
                           p.nome as professor_nome, pr.id as prova_id, pr.codigo as prova_codigo,
                           count(r.id) as resultados_sem_nota
                      from provas pr
                      join turmas t on t.id = pr.turma_id
                      left join disciplinas d on d.id = t.disciplina_id
                      left join professores p on p.id = t.professor_id
                      join resultados_prova r on r.prova_id = pr.id
                      join matriculas_em_turma m on m.id = r.matricula_id and m.situacao = 'ATIVA'
                     where r.nota is null
                     group by t.id, t.codigo, d.nome, p.nome, pr.id, pr.codigo
                     order by resultados_sem_nota desc
                )
                fetch first 8 rows only
                """, (rs, rowNum) -> new PendenciaNotaItem(
                rs.getLong("turma_id"),
                rs.getString("turma_codigo"),
                rs.getString("disciplina_nome"),
                rs.getString("professor_nome"),
                rs.getLong("prova_id"),
                rs.getString("prova_codigo"),
                rs.getLong("resultados_sem_nota")
        ));
    }

    private List<OcupacaoTurmaItem> ocupacaoTurmas() {
        return jdbc.query("""
                select * from (
                    select t.id as turma_id, t.codigo as turma_codigo, c.nome as curso_nome,
                           d.nome as disciplina_nome, t.vagas, t.status,
                           count(m.id) as ocupadas,
                           case when (t.vagas + count(m.id)) > 0
                                then round((count(m.id) * 100) / (t.vagas + count(m.id)), 2)
                                else 0
                           end as ocupacao
                      from turmas t
                      left join disciplinas d on d.id = t.disciplina_id
                      left join cursos c on c.id = d.curso_id
                      left join matriculas_em_turma m on m.turma_id = t.id and m.situacao = 'ATIVA'
                     where t.ativo = 1
                     group by t.id, t.codigo, c.nome, d.nome, t.vagas, t.status
                     order by ocupacao desc
                )
                fetch first 8 rows only
                """, (rs, rowNum) -> new OcupacaoTurmaItem(
                rs.getLong("turma_id"),
                rs.getString("turma_codigo"),
                rs.getString("curso_nome"),
                rs.getString("disciplina_nome"),
                rs.getLong("vagas"),
                rs.getLong("ocupadas"),
                rs.getDouble("ocupacao"),
                rs.getString("status")
        ));
    }

    private List<AuditoriaNotaItem> auditoriasNotas() {
        return jdbc.query("""
                select * from (
                    select ar.id, ar.resultado_id, ar.prova_id, pr.codigo as prova_codigo,
                           a.nome as aluno_nome, ar.nota_anterior, ar.nota_nova,
                           ar.usuario_login, ar.motivo, ar.alterado_em
                      from auditoria_resultados ar
                      join provas pr on pr.id = ar.prova_id
                      join matriculas_em_turma m on m.id = ar.matricula_id
                      join alunos a on a.id = m.aluno_id
                     order by ar.alterado_em desc
                )
                fetch first 8 rows only
                """, (rs, rowNum) -> new AuditoriaNotaItem(
                rs.getLong("id"),
                rs.getLong("resultado_id"),
                rs.getLong("prova_id"),
                rs.getString("prova_codigo"),
                rs.getString("aluno_nome"),
                rs.getObject("nota_anterior") != null ? rs.getDouble("nota_anterior") : null,
                rs.getObject("nota_nova") != null ? rs.getDouble("nota_nova") : null,
                rs.getString("usuario_login"),
                rs.getString("motivo"),
                rs.getTimestamp("alterado_em").toLocalDateTime().toString()
        ));
    }

    public record Metricas(
            long totalCursos,
            long totalDisciplinas,
            long totalProfessores,
            long totalAlunos,
            long totalTurmas,
            long totalMatriculas,
            long totalProvas,
            long totalResultados
    ) {
    }

    public record ChartItem(String label, long value) {
    }

    public record TimelineItem(String title, String detail, String href, String tone) {
    }

    public record AlunoRiscoItem(
            long alunoId,
            String alunoNome,
            int alunoMatricula,
            String cursoNome,
            String turmaCodigo,
            String disciplinaNome,
            Double media,
            Double frequencia
    ) {
    }

    public record PendenciaNotaItem(
            long turmaId,
            String turmaCodigo,
            String disciplinaNome,
            String professorNome,
            long provaId,
            String provaCodigo,
            long resultadosSemNota
    ) {
    }

    public record OcupacaoTurmaItem(
            long turmaId,
            String turmaCodigo,
            String cursoNome,
            String disciplinaNome,
            long vagas,
            long ocupadas,
            double ocupacao,
            String status
    ) {
    }

    public record AuditoriaNotaItem(
            long id,
            long resultadoId,
            long provaId,
            String provaCodigo,
            String alunoNome,
            Double notaAnterior,
            Double notaNova,
            String usuarioLogin,
            String motivo,
            String alteradoEm
    ) {
    }

    public record AdminDashboardResumo(
            Metricas metricas,
            long turmasSemProfessor,
            long turmasNoturnas,
            long vagasTotais,
            long cursosSemCoordenador,
            long alunosSemEmail,
            List<ChartItem> alunosPorCurso,
            List<ChartItem> turmasPorTurno,
            List<ChartItem> turmasPorStatus,
            List<ChartItem> disciplinasPorCurso,
            List<TimelineItem> timeline,
            List<AlunoRiscoItem> alunosRisco,
            List<PendenciaNotaItem> pendenciasNotas,
            List<OcupacaoTurmaItem> ocupacaoTurmas,
            List<AuditoriaNotaItem> auditoriasNotas
    ) {
    }
}
