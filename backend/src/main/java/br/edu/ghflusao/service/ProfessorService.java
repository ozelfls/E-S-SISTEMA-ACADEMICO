package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Professor;
import br.edu.ghflusao.dto.request.ProfessorRequestDTO;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.repository.ProfessorRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final TurmaRepository turmaRepository;

    public List<Professor> listar() {
        return professorRepository.findAll();
    }

    public Professor buscarPorId(Long id) {
        return professorRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
    }

    @Transactional
    public Professor criar(ProfessorRequestDTO dto) {
        Professor professor = new Professor();
        aplicar(professor, dto);
        Professor criado = professorRepository.save(professor);
        log.info("Professor criado: professorId={}", criado.getId());
        return criado;
    }

    @Transactional
    public Professor atualizar(Long id, ProfessorRequestDTO dto) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        aplicar(professor, dto);
        Professor atualizado = professorRepository.save(professor);
        log.info("Professor atualizado: professorId={}", atualizado.getId());
        return atualizado;
    }

    @Transactional
    public void excluir(Long id) {
        if (!professorRepository.existsById(id)) {
            throw new BusinessException("Entidade não encontrada.");
        }
        if (turmaRepository.existsByProfessorIdAndAtivoTrue(id)) {
            throw new BusinessException("Não é permitido excluir professor com turmas ativas.");
        }
        professorRepository.deleteById(id);
        log.info("Professor excluído: professorId={}", id);
    }

    private void aplicar(Professor professor, ProfessorRequestDTO dto) {
        professor.setNome(dto.nome());
        professor.setCpf(CpfFormatter.format(dto.cpf()));
        professor.setEmail(dto.email());
        professor.setTelefone(dto.telefone());
        professor.setEndereco(dto.endereco());
        professor.setDtNascimento(dto.dtNascimento());
        professor.setRegistro(dto.registro());
        professor.setTitulacao(dto.titulacao());
        professor.setRegimeTrabalho(dto.regimeTrabalho());
    }
}
