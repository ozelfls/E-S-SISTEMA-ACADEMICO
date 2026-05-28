package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.domain.Disciplina;
import br.edu.ghflusao.domain.Professor;
import br.edu.ghflusao.dto.request.CursoRequestDTO;
import br.edu.ghflusao.dto.request.DisciplinaRequestDTO;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.exception.ResourceNotFoundException;
import br.edu.ghflusao.repository.AlunoRepository;
import br.edu.ghflusao.repository.CursoRepository;
import br.edu.ghflusao.repository.DisciplinaRepository;
import br.edu.ghflusao.repository.ProfessorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CursoService {

    private final CursoRepository cursoRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final ProfessorRepository professorRepository;
    private final AlunoRepository alunoRepository;

    @Transactional(readOnly = true)
    public List<Curso> listar() {
        return cursoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Curso buscarPorId(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
    }

    public Curso criar(CursoRequestDTO dto) {
        Curso curso = new Curso();
        curso.setNome(dto.nome());
        curso.setChTotal(dto.chTotal());
        curso.setPrevTerminoAnos(dto.prevTerminoAnos());
        curso.setLimiteConclusao(dto.limiteConclusao());
        Curso criado = cursoRepository.save(curso);
        log.info("Curso criado: cursoId={}", criado.getId());
        return criado;
    }

    public Curso atualizar(Long id, CursoRequestDTO dto) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Entidade não encontrada."));
        curso.setNome(dto.nome());
        curso.setChTotal(dto.chTotal());
        curso.setPrevTerminoAnos(dto.prevTerminoAnos());
        curso.setLimiteConclusao(dto.limiteConclusao());
        Curso atualizado = cursoRepository.save(curso);
        log.info("Curso atualizado: cursoId={}", atualizado.getId());
        return atualizado;
    }

    public void excluir(Long id) {
        if (!cursoRepository.existsById(id)) {
            throw new BusinessException("Entidade não encontrada.");
        }
        if (disciplinaRepository.existsByCursoId(id) || alunoRepository.existsByCursoId(id)) {
            throw new BusinessException("Não é permitido excluir curso com alunos ou disciplinas vinculadas, inclusive registros historicos.");
        }
        cursoRepository.deleteById(id);
        log.info("Curso excluído: cursoId={}", id);
    }

    public Disciplina adicionarDisciplina(Long cursoId, DisciplinaRequestDTO dto) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + cursoId));
        Disciplina disciplina = new Disciplina();
        disciplina.setCodigo(gerarCodigoDisciplina());
        disciplina.setNome(dto.nome());
        disciplina.setCreditos(dto.creditos());
        disciplina.setCh(dto.ch());
        disciplina.setEmenta(dto.ementa());
        disciplina.setModalidade(dto.modalidade());
        disciplina.setCurso(curso);

        if (dto.preRequisitoId() != null) {
            Disciplina pre = disciplinaRepository.findByIdAndAtivoTrue(dto.preRequisitoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pré-requisito não encontrado: " + dto.preRequisitoId()));
            disciplina.setPreRequisito(pre);
        }
        Disciplina criada = disciplinaRepository.save(disciplina);
        log.info("Disciplina adicionada ao curso: cursoId={}, disciplinaId={}", cursoId, criada.getId());
        return criada;
    }

    public Curso definirCoordenador(Long cursoId, Long professorId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + cursoId));
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado: " + professorId));
        curso.setCoordenador(professor);
        Curso atualizado = cursoRepository.save(curso);
        log.info("Coordenador definido: cursoId={}, professorId={}", cursoId, professorId);
        return atualizado;
    }
    private String gerarCodigoDisciplina() {
        for (int tentativa = 0; tentativa < 50; tentativa++) {
            String codigo = "D" + ThreadLocalRandom.current().nextInt(100000, 1000000);
            if (!disciplinaRepository.existsByCodigo(codigo)) {
                return codigo;
            }
        }
        throw new BusinessException("Nao foi possivel gerar o codigo da disciplina. Tente novamente.");
    }
}
