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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;
    private final MatriculaEmTurmaRepository matriculaRepository;

    public AlunoResponseDTO criar(AlunoCreateDTO dto) {
        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + dto.cursoId()));
        Aluno aluno = new Aluno();
        aluno.setNome(dto.nome());
        aluno.setCpf(dto.cpf());
        aluno.setMatriculaId(proximaMatricula(dto.matriculaId()));
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
        aluno.setCpf(dto.cpf());
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

    private Integer proximaMatricula(Integer matriculaInformada) {
        if (matriculaInformada != null) {
            if (alunoRepository.existsByMatriculaId(matriculaInformada)) {
                throw new BusinessException("Matrícula já cadastrada para outro aluno.");
            }
            return matriculaInformada;
        }
        return alunoRepository.findMaiorMatriculaId() + 1;
    }

    private AlunoResponseDTO toResponse(Aluno aluno) {
        return new AlunoResponseDTO(
                aluno.getId(),
                aluno.getNome(),
                aluno.getMatriculaId(),
                aluno.getTurno(),
                aluno.getCurso() != null ? aluno.getCurso().getId() : null,
                aluno.getCurso() != null ? aluno.getCurso().getNome() : null,
                aluno.getEmail()
        );
    }
}
