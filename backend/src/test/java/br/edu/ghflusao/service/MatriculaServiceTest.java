package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Aluno;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.enums.StatusTurma;
import br.edu.ghflusao.enums.Situacao;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.repository.AlunoRepository;
import br.edu.ghflusao.repository.MatriculaEmTurmaRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatriculaServiceTest {

    @Mock
    private AlunoRepository alunoRepository;
    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private MatriculaEmTurmaRepository matriculaRepository;

    @InjectMocks
    private MatriculaService matriculaService;

    @Test
    void deveFalharQuandoTurmaSemVagas() {
        Aluno aluno = new Aluno();
        aluno.setId(1L);
        Turma turma = new Turma();
        turma.setId(10L);
        turma.setVagas(0);
        turma.setStatus(StatusTurma.OPEN);
        turma.setDisciplina(new Disciplina());

        when(alunoRepository.findById(1L)).thenReturn(Optional.of(aluno));
        when(turmaRepository.findByIdAndAtivoTrue(10L)).thenReturn(Optional.of(turma));

        assertThrows(BusinessException.class, () -> matriculaService.matricularAluno(1L, 10L));
    }

    @Test
    void deveFalharQuandoJaMatriculado() {
        Aluno aluno = new Aluno();
        aluno.setId(1L);
        Turma turma = new Turma();
        turma.setId(10L);
        turma.setVagas(2);
        turma.setStatus(StatusTurma.OPEN);
        turma.setDisciplina(new Disciplina());

        when(alunoRepository.findById(1L)).thenReturn(Optional.of(aluno));
        when(turmaRepository.findByIdAndAtivoTrue(10L)).thenReturn(Optional.of(turma));
        when(matriculaRepository.existsByAlunoIdAndTurmaId(1L, 10L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> matriculaService.matricularAluno(1L, 10L));
    }

    @Test
    void deveFalharQuandoNaoCumprePreRequisito() {
        Aluno aluno = new Aluno();
        aluno.setId(1L);

        Disciplina pre = new Disciplina();
        pre.setId(100L);
        pre.setCodigo("ENG201");
        Disciplina atual = new Disciplina();
        atual.setPreRequisito(pre);

        Turma turma = new Turma();
        turma.setId(10L);
        turma.setVagas(2);
        turma.setStatus(StatusTurma.OPEN);
        turma.setDisciplina(atual);

        when(alunoRepository.findById(1L)).thenReturn(Optional.of(aluno));
        when(turmaRepository.findByIdAndAtivoTrue(10L)).thenReturn(Optional.of(turma));
        when(matriculaRepository.existsByAlunoIdAndTurmaId(1L, 10L)).thenReturn(false);
        when(matriculaRepository.existsByAlunoIdAndTurmaDisciplinaIdAndSituacao(1L, 100L, Situacao.CONCLUIDA))
                .thenReturn(false);

        assertThrows(BusinessException.class, () -> matriculaService.matricularAluno(1L, 10L));
    }

    @Test
    void deveFalharQuandoTurmaFechada() {
        Aluno aluno = new Aluno();
        aluno.setId(1L);
        Turma turma = new Turma();
        turma.setId(10L);
        turma.setVagas(10);
        turma.setStatus(StatusTurma.CLOSED);

        when(alunoRepository.findById(1L)).thenReturn(Optional.of(aluno));
        when(turmaRepository.findByIdAndAtivoTrue(10L)).thenReturn(Optional.of(turma));

        assertThrows(BusinessException.class, () -> matriculaService.matricularAluno(1L, 10L));
    }

    @Test
    void deveFalharQuandoHaConflitoDeHorario() {
        Aluno aluno = new Aluno();
        aluno.setId(1L);
        Turma turma = new Turma();
        turma.setId(10L);
        turma.setVagas(10);
        turma.setStatus(StatusTurma.OPEN);
        turma.setSemestre("2026.1");
        turma.setAno(2026);
        turma.setHorario("19:00-20:40");
        turma.setTurno(br.edu.ghflusao.enums.Turno.NOITE);
        turma.setDisciplina(new Disciplina());

        when(alunoRepository.findById(1L)).thenReturn(Optional.of(aluno));
        when(turmaRepository.findByIdAndAtivoTrue(10L)).thenReturn(Optional.of(turma));
        when(matriculaRepository.existsByAlunoIdAndTurmaId(1L, 10L)).thenReturn(false);
        when(matriculaRepository.existsHorarioConflitante(1L, "2026.1", 2026, br.edu.ghflusao.enums.Turno.NOITE, "19:00-20:40"))
                .thenReturn(true);

        assertThrows(BusinessException.class, () -> matriculaService.matricularAluno(1L, 10L));
    }
}
