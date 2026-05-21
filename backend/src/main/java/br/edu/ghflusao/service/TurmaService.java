package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.domain.MatriculaEmTurma;
import br.edu.ghflusao.domain.Professor;
import br.edu.ghflusao.domain.Turma;
import br.edu.ghflusao.dto.request.TurmaRequestDTO;
import br.edu.ghflusao.enums.StatusTurma;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.exception.ResourceNotFoundException;
import br.edu.ghflusao.repository.DisciplinaRepository;
import br.edu.ghflusao.repository.MatriculaEmTurmaRepository;
import br.edu.ghflusao.repository.ProfessorRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final ProfessorRepository professorRepository;
    private final MatriculaEmTurmaRepository matriculaRepository;
    private final MatriculaService matriculaService;

    public Turma criarTurma(Long disciplinaId, TurmaRequestDTO dto) {
        Disciplina disciplina = disciplinaRepository.findByIdAndAtivoTrue(disciplinaId)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina não encontrada: " + disciplinaId));
        Turma turma = new Turma();
        turma.setCodigo(dto.codigo());
        turma.setHorario(dto.horario());
        turma.setVagas(dto.vagas());
        turma.setCargaHoraria(disciplina.getCh());
        turma.setSemestre(dto.semestre());
        turma.setAno(dto.ano());
        turma.setTurno(dto.turno());
        turma.setSala(dto.sala());
        turma.setStatus(dto.status() != null ? dto.status() : StatusTurma.OPEN);
        turma.setAtivo(true);
        turma.setDisciplina(disciplina);
        if (dto.professorId() != null) {
            Professor professor = professorRepository.findById(dto.professorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado: " + dto.professorId()));
            turma.setProfessor(professor);
        } else if (disciplina.getCurso() != null && disciplina.getCurso().getCoordenador() != null) {
            turma.setProfessor(disciplina.getCurso().getCoordenador());
        }
        validarConflitoProfessor(turma);
        Turma criada = turmaRepository.save(turma);
        log.info("Turma criada: turmaId={}, disciplinaId={}, status={}", criada.getId(), disciplinaId, criada.getStatus());
        return criada;
    }

    @Transactional(readOnly = true)
    public List<Turma> listar(String semestre, Integer ano) {
        return listar(semestre, ano, null);
    }

    @Transactional(readOnly = true)
    public List<Turma> listar(String semestre, Integer ano, Long cursoId) {
        if (cursoId != null) {
            return turmaRepository.findByCursoIdAndPeriodo(cursoId, semestre, ano);
        }
        if (semestre != null && ano != null) {
            return turmaRepository.findBySemestreAndAnoAndAtivoTrue(semestre, ano);
        }
        return turmaRepository.findByAtivoTrue();
    }

    @Transactional(readOnly = true)
    public Turma buscarPorId(Long id) {
        return turmaRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
    }

    public Turma atualizar(Long id, TurmaRequestDTO dto) {
        Turma turma = turmaRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        turma.setCodigo(dto.codigo());
        turma.setHorario(dto.horario());
        turma.setVagas(dto.vagas());
        turma.setSemestre(dto.semestre());
        turma.setAno(dto.ano());
        turma.setTurno(dto.turno());
        turma.setSala(dto.sala());
        if (dto.status() != null) {
            turma.setStatus(dto.status());
        }
        if (dto.disciplinaId() != null) {
            Disciplina disciplina = disciplinaRepository.findByIdAndAtivoTrue(dto.disciplinaId())
                    .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
            turma.setDisciplina(disciplina);
            turma.setCargaHoraria(disciplina.getCh());
        }
        if (dto.professorId() != null) {
            Professor professor = professorRepository.findById(dto.professorId())
                    .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
            turma.setProfessor(professor);
        } else {
            turma.setProfessor(null);
        }
        validarConflitoProfessor(turma);
        Turma atualizada = turmaRepository.save(turma);
        log.info("Turma atualizada: turmaId={}, status={}", atualizada.getId(), atualizada.getStatus());
        return atualizada;
    }

    public Turma alocarProfessor(Long turmaId, Long professorId) {
        Turma turma = turmaRepository.findByIdAndAtivoTrue(turmaId)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        if (professorId != null) {
            Professor professor = professorRepository.findById(professorId)
                    .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
            turma.setProfessor(professor);
        } else {
            turma.setProfessor(null);
        }
        validarConflitoProfessor(turma);
        Turma atualizada = turmaRepository.save(turma);
        log.info("Professor alocado em turma: turmaId={}, professorId={}", turmaId, professorId);
        return atualizada;
    }

    public void excluir(Long id) {
        Turma turma = turmaRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        if (matriculaRepository.existsByTurmaId(id)) {
            throw new BusinessException("Não é permitido excluir turma com alunos matriculados.");
        }
        turma.setAtivo(false);
        turmaRepository.save(turma);
        log.info("Turma desativada (soft delete): turmaId={}", id);
    }

    @Transactional(readOnly = true)
    public List<MatriculaEmTurma> listarAlunosDaTurma(Long turmaId) {
        return matriculaService.getMatriculasPorTurma(turmaId);
    }

    private void validarConflitoProfessor(Turma turma) {
        if (turma.getProfessor() == null || turma.getHorario() == null || turma.getTurno() == null) {
            return;
        }
        boolean conflito = turmaRepository.existsProfessorConflict(
                turma.getId() == null ? -1L : turma.getId(),
                turma.getSemestre(),
                turma.getAno(),
                turma.getTurno(),
                turma.getHorario(),
                turma.getProfessor().getId()
        );
        if (conflito) {
            throw new BusinessException("Professor já possui turma no mesmo horário para o semestre informado.");
        }
    }
}
