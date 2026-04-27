package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Prova;
import br.edu.ghflusao.domain.ResultadoProva;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.dto.request.ResultadoRequestDTO;
import br.edu.ghflusao.enums.StatusTurma;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.repository.MatriculaEmTurmaRepository;
import br.edu.ghflusao.repository.ProvaRepository;
import br.edu.ghflusao.repository.ResultadoProvaRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProvaServiceTest {

    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private ProvaRepository provaRepository;
    @Mock
    private MatriculaEmTurmaRepository matriculaRepository;
    @Mock
    private ResultadoProvaRepository resultadoRepository;
    @Mock
    private AcademicPerformanceService academicPerformanceService;

    @InjectMocks
    private ProvaService provaService;

    @Test
    void deveFalharQuandoNotaInvalida() {
        Turma turma = new Turma();
        turma.setStatus(StatusTurma.OPEN);
        Prova prova = new Prova();
        prova.setTurma(turma);
        ResultadoProva r = new ResultadoProva();
        r.setId(1L);
        r.setProva(prova);
        when(resultadoRepository.findById(1L)).thenReturn(Optional.of(r));

        ResultadoRequestDTO dto = new ResultadoRequestDTO(11.0, true, LocalDate.now(), 120);
        assertThrows(BusinessException.class, () -> provaService.lancarResultado(1L, dto));
    }

    @Test
    void deveFalharQuandoTurmaFechadaParaLancarResultado() {
        Turma turma = new Turma();
        turma.setStatus(StatusTurma.CLOSED);
        Prova prova = new Prova();
        prova.setTurma(turma);
        ResultadoProva resultado = new ResultadoProva();
        resultado.setId(2L);
        resultado.setProva(prova);

        when(resultadoRepository.findById(2L)).thenReturn(Optional.of(resultado));

        ResultadoRequestDTO dto = new ResultadoRequestDTO(8.0, true, LocalDate.now(), 120);
        assertThrows(BusinessException.class, () -> provaService.lancarResultado(2L, dto));
    }
}
