package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Aluno;
import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.dto.request.AlunoCreateDTO;
import br.edu.ghflusao.dto.response.AlunoResponseDTO;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.exception.ResourceNotFoundException;
import br.edu.ghflusao.repository.AlunoRepository;
import br.edu.ghflusao.repository.CursoRepository;
import br.edu.ghflusao.repository.MatriculaEmTurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AlunoService {

    private static final int PRIMEIRA_MATRICULA = 100000;
    private static final int ULTIMA_MATRICULA = 999999;

    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;
    private final MatriculaEmTurmaRepository matriculaRepository;
    private final JdbcTemplate jdbc;

    public AlunoResponseDTO criar(AlunoCreateDTO dto) {
        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + dto.cursoId()));
        Aluno aluno = new Aluno();
        aluno.setNome(dto.nome());
        aluno.setCpf(CpfFormatter.format(dto.cpf()));
        aluno.setMatriculaId(proximaMatricula());
        aluno.setTurno(dto.turno());
        aluno.setCurso(curso);
        aluno.setEmail(dto.email());
        aluno = alunoRepository.save(aluno);
        log.info("Aluno criado: id={}, matriculaId={}, cursoId={}", aluno.getId(), aluno.getMatriculaId(), curso.getId());
        return toResponse(aluno);
    }

    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> listar() {
        return alunoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AlunoResponseDTO buscarPorId(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        return toResponse(aluno);
    }

    public AlunoResponseDTO atualizar(Long id, AlunoCreateDTO dto) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        aluno.setNome(dto.nome());
        aluno.setCpf(CpfFormatter.format(dto.cpf()));
        if (dto.matriculaId() != null && !dto.matriculaId().equals(aluno.getMatriculaId())) {
            throw new BusinessException("Matrícula é imutável e não pode ser alterada.");
        }
        aluno.setTurno(dto.turno());
        aluno.setCurso(curso);
        aluno.setEmail(dto.email());
        aluno = alunoRepository.save(aluno);
        log.info("Aluno atualizado: id={}, cursoId={}", aluno.getId(), curso.getId());
        return toResponse(aluno);
    }

    public void excluir(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        if (matriculaRepository.findByAlunoIdOrderByDtInscricaoDesc(id).size() > 0) {
            throw new BusinessException("Não é permitido excluir aluno com histórico de matrículas.");
        }
        alunoRepository.deleteById(id);
        log.info("Aluno excluído: id={}, matriculaId={}", aluno.getId(), aluno.getMatriculaId());
    }

    private Integer proximaMatricula() {
        Integer proxima = Math.max(nextMatriculaId(), PRIMEIRA_MATRICULA);
        if (proxima > ULTIMA_MATRICULA) {
            throw new BusinessException("Limite de matriculas de 6 digitos atingido.");
        }
        return proxima;
    }

    private Integer nextMatriculaId() {
        Integer next = jdbc.queryForObject("select nextval('seq_aluno_matricula')", Integer.class);
        if (next == null) {
            throw new BusinessException("Nao foi possivel gerar a proxima matricula.");
        }
        return next;
    }

    private AlunoResponseDTO toResponse(Aluno aluno) {
        return new AlunoResponseDTO(
                aluno.getId(),
                aluno.getNome(),
                aluno.getCpf(),
                aluno.getMatriculaId(),
                aluno.getTurno(),
                aluno.getCurso() != null ? aluno.getCurso().getId() : null,
                aluno.getCurso() != null ? aluno.getCurso().getNome() : null,
                aluno.getEmail()
        );
    }
}
