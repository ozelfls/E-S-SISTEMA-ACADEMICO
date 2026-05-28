package br.edu.ghflusao.service;

import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.repository.AlunoRepository;
import br.edu.ghflusao.repository.CursoRepository;
import br.edu.ghflusao.repository.DisciplinaRepository;
import br.edu.ghflusao.repository.ProfessorRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeletionGuardTest {

    @Mock
    private CursoRepository cursoRepository;
    @Mock
    private DisciplinaRepository disciplinaRepository;
    @Mock
    private ProfessorRepository professorRepository;
    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private AlunoRepository alunoRepository;

    @InjectMocks
    private CursoService cursoService;
    @InjectMocks
    private ProfessorService professorService;

    @Test
    void deveBloquearExclusaoDeCursoComDisciplinaHistorica() {
        when(cursoRepository.existsById(11L)).thenReturn(true);
        when(disciplinaRepository.existsByCursoId(11L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> cursoService.excluir(11L));
    }

    @Test
    void deveBloquearExclusaoDeProfessorComTurmaHistorica() {
        when(professorRepository.existsById(11L)).thenReturn(true);
        when(turmaRepository.existsByProfessorId(11L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> professorService.excluir(11L));
    }

    @Test
    void deveBloquearExclusaoDeProfessorCoordenador() {
        when(professorRepository.existsById(12L)).thenReturn(true);
        when(turmaRepository.existsByProfessorId(12L)).thenReturn(false);
        when(cursoRepository.existsByCoordenadorId(12L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> professorService.excluir(12L));
    }
}
