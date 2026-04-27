package br.edu.ghflusao.dto.response.consulta;

import br.edu.ghflusao.enums.Modalidade;
import br.edu.ghflusao.enums.Situacao;
import br.edu.ghflusao.enums.Turno;

import java.time.LocalDate;
import java.util.List;

public class ConsultaDTOs {

    private ConsultaDTOs() {
    }

    public record ProfessorBrief(Long id, String nome, String email, String registro, String titulacao) {
    }

    public record DisciplinaBrief(Long id, String codigo, String nome, Integer creditos, Integer ch, Modalidade modalidade) {
    }

    public record DisciplinaSlim(Long id, String codigo, String nome) {
    }

    public record CursoBrief(Long id, String nome) {
    }

    public record CursoFull(Long id, String nome, Integer chTotal, Integer prevTerminoAnos) {
    }

    public record AlunoBrief(Long id, String nome, Integer matriculaId, String cpf, String email, Turno turno) {
    }

    public record AlunoSlim(Long id, String nome, Integer matriculaId) {
    }

    public record TurmaBrief(Long id, String codigo, String semestre, Integer ano, String sala, String horario) {
    }

    public record TurmaWithCounts(
            Long id,
            String codigo,
            String semestre,
            Integer ano,
            Turno turno,
            String sala,
            Integer vagas,
            String horario,
            DisciplinaBrief disciplina,
            CursoBrief curso,
            long totalAlunos,
            long totalProvas
    ) {
    }

    public record ProfessorTurmasResponse(
            ProfessorBrief professor,
            int totalTurmas,
            List<TurmaWithCounts> turmas
    ) {
    }

    public record ResultadoBrief(Double nota, Boolean presente, LocalDate dataRealizacao) {
    }

    public record ProvaWithResultado(
            Long id,
            String codigo,
            Double peso,
            String conteudo,
            ResultadoBrief resultado
    ) {
    }

    public record MatriculaTrajetoria(
            Long id,
            LocalDate dtInscricao,
            Situacao situacao,
            Double frequencia,
            String observacao,
            TurmaBrief turma,
            DisciplinaBriefForMatricula disciplina,
            ProfessorSlim professor,
            List<ProvaWithResultado> provas,
            Double mediaPonderada
    ) {
    }

    public record DisciplinaBriefForMatricula(Long id, String codigo, String nome, Integer creditos, Integer ch) {
    }

    public record ProfessorSlim(Long id, String nome) {
    }

    public record TrajetoriaResponse(
            AlunoBrief aluno,
            CursoFull curso,
            int totalMatriculas,
            int matriculasAtivas,
            int matriculasConcluidas,
            List<MatriculaTrajetoria> matriculas
    ) {
    }

    public record TurmaDetalhe(
            Long id,
            String codigo,
            String semestre,
            Integer ano,
            Turno turno,
            String sala,
            String horario,
            Integer vagas
    ) {
    }

    public record ProfessorContato(Long id, String nome, String email) {
    }

    public record AlunoMatriculado(
            Long matriculaId,
            Situacao situacao,
            Double frequencia,
            AlunoSlim aluno,
            Double mediaPonderada
    ) {
    }

    public record ProvaResumo(
            Long id,
            String codigo,
            Double peso,
            String conteudo,
            long totalResultados,
            Double mediaTurma
    ) {
    }

    public record TurmaDetalhesResponse(
            TurmaDetalhe turma,
            DisciplinaBrief disciplina,
            CursoBrief curso,
            ProfessorContato professor,
            long totalAlunos,
            long vagasRestantes,
            List<AlunoMatriculado> alunos,
            List<ProvaResumo> provas
    ) {
    }

    public record DisciplinaFull(
            Long id,
            String codigo,
            String nome,
            Integer creditos,
            Integer ch,
            Modalidade modalidade,
            String ementa
    ) {
    }

    public record TurmaHistorico(
            Long id,
            String codigo,
            String semestre,
            Integer ano,
            Integer vagas,
            ProfessorSlim professor,
            long totalAlunos,
            Double mediaTurma
    ) {
    }

    public record ProfessorLecionou(Long id, String nome, long totalTurmas) {
    }

    public record DisciplinaHistoricoResponse(
            DisciplinaFull disciplina,
            CursoBrief curso,
            DisciplinaSlim preRequisito,
            int totalTurmas,
            List<TurmaHistorico> turmas,
            List<ProfessorLecionou> professoresQueLecionaram
    ) {
    }

    public record TurmaSemestre(
            Long id,
            String codigo,
            String sala,
            String horario,
            Integer vagas,
            long ocupadas,
            Double ocupacao,
            DisciplinaSlim disciplina,
            ProfessorSlim professor
    ) {
    }

    public record SemestreResponse(
            String semestre,
            Integer ano,
            int totalTurmas,
            long totalVagas,
            long totalMatriculas,
            long totalProfessoresAtivos,
            Double ocupacaoMedia,
            List<TurmaSemestre> turmas
    ) {
    }

    public record AlunoBuscaItem(Long id, String nome, Integer matriculaId, String cursoNome) {
    }

    public record ProfessorBuscaItem(Long id, String nome, String email) {
    }

    public record DisciplinaBuscaItem(Long id, String codigo, String nome) {
    }

    public record TurmaBuscaItem(Long id, String codigo, String semestre, Integer ano, String disciplinaNome) {
    }

    public record CursoBuscaItem(Long id, String nome) {
    }

    public record BuscarResponse(
            String q,
            List<AlunoBuscaItem> alunos,
            List<ProfessorBuscaItem> professores,
            List<DisciplinaBuscaItem> disciplinas,
            List<TurmaBuscaItem> turmas,
            List<CursoBuscaItem> cursos,
            int totalHits
    ) {
    }
}
