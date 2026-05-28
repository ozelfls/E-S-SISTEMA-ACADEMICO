package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Professor;
import br.edu.ghflusao.dto.request.ProfessorRequestDTO;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.repository.CursoRepository;
import br.edu.ghflusao.repository.ProfessorRepository;
import br.edu.ghflusao.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final TurmaRepository turmaRepository;
    private final CursoRepository cursoRepository;

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
        professor.setRegistro(gerarRegistro());
        aplicar(professor, dto);
        Professor criado = professorRepository.save(professor);
        log.info("Professor criado: professorId={}, registro={}", criado.getId(), criado.getRegistro());
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
        if (turmaRepository.existsByProfessorId(id) || cursoRepository.existsByCoordenadorId(id)) {
            throw new BusinessException("Não é permitido excluir professor com turmas ou coordenacoes vinculadas, inclusive registros historicos.");
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
        professor.setTitulacao(dto.titulacao());
        professor.setRegimeTrabalho(dto.regimeTrabalho());
    }

    private String gerarRegistro() {
        for (int tentativa = 0; tentativa < 50; tentativa++) {
            String registro = "PROF" + ThreadLocalRandom.current().nextInt(100000, 1000000);
            if (!professorRepository.existsByRegistro(registro)) {
                return registro;
            }
        }
        throw new BusinessException("Nao foi possivel gerar o registro do professor. Tente novamente.");
    }
}
