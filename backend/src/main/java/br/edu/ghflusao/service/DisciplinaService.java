package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.dto.request.DisciplinaRequestDTO;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.repository.CursoRepository;
import br.edu.ghflusao.repository.DisciplinaRepository;
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
public class DisciplinaService {

    private final DisciplinaRepository disciplinaRepository;
    private final CursoRepository cursoRepository;
    private final TurmaRepository turmaRepository;

    public List<Disciplina> listar() {
        return disciplinaRepository.findByAtivoTrue();
    }

    public List<Disciplina> listarPorCurso(Long cursoId) {
        return disciplinaRepository.findByCursoIdAndAtivoTrue(cursoId);
    }

    public Disciplina buscarPorId(Long id) {
        return disciplinaRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
    }

    @Transactional
    public Disciplina criar(DisciplinaRequestDTO dto) {
        if (dto.cursoId() == null) {
            throw new BusinessException("cursoId é obrigatório.");
        }
        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        Disciplina disciplina = new Disciplina();
        disciplina.setCodigo(gerarCodigo());
        disciplina.setNome(dto.nome());
        disciplina.setCreditos(dto.creditos());
        disciplina.setCh(dto.ch());
        disciplina.setEmenta(dto.ementa());
        disciplina.setModalidade(dto.modalidade());
        disciplina.setCurso(curso);
        disciplina.setAtivo(true);
        if (dto.preRequisitoId() != null) {
            Disciplina pre = disciplinaRepository.findByIdAndAtivoTrue(dto.preRequisitoId())
                    .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
            disciplina.setPreRequisito(pre);
        }
        Disciplina criada = disciplinaRepository.save(disciplina);
        log.info("Disciplina criada: disciplinaId={}, cursoId={}", criada.getId(), curso.getId());
        return criada;
    }

    @Transactional
    public Disciplina atualizar(Long id, DisciplinaRequestDTO dto) {
        Disciplina disciplina = disciplinaRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        disciplina.setNome(dto.nome());
        disciplina.setCreditos(dto.creditos());
        disciplina.setCh(dto.ch());
        disciplina.setEmenta(dto.ementa());
        disciplina.setModalidade(dto.modalidade());
        if (dto.cursoId() != null) {
            Curso curso = cursoRepository.findById(dto.cursoId())
                    .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
            disciplina.setCurso(curso);
        }
        if (dto.preRequisitoId() != null) {
            Disciplina pre = disciplinaRepository.findByIdAndAtivoTrue(dto.preRequisitoId())
                    .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
            disciplina.setPreRequisito(pre);
        } else {
            disciplina.setPreRequisito(null);
        }
        Disciplina atualizada = disciplinaRepository.save(disciplina);
        log.info("Disciplina atualizada: disciplinaId={}", atualizada.getId());
        return atualizada;
    }

    @Transactional
    public void excluir(Long id) {
        Disciplina disciplina = disciplinaRepository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        if (turmaRepository.existsByDisciplinaIdAndAtivoTrue(id)) {
            throw new BusinessException("Não é permitido excluir disciplina com turmas ativas.");
        }
        disciplina.setAtivo(false);
        disciplinaRepository.save(disciplina);
        log.info("Disciplina desativada (soft delete): disciplinaId={}", id);
    }

    private String gerarCodigo() {
        for (int tentativa = 0; tentativa < 50; tentativa++) {
            String codigo = "D" + ThreadLocalRandom.current().nextInt(100000, 1000000);
            if (!disciplinaRepository.existsByCodigo(codigo)) {
                return codigo;
            }
        }
        throw new BusinessException("Nao foi possivel gerar o codigo da disciplina. Tente novamente.");
    }
}
