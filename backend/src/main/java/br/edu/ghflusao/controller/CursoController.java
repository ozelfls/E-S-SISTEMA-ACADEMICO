package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.request.CursoRequestDTO;
import br.edu.ghflusao.dto.request.DisciplinaRequestDTO;
import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.dto.response.CursoResponseDTO;
import br.edu.ghflusao.dto.response.DisciplinaResponseDTO;
import br.edu.ghflusao.service.CursoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService cursoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DIRETOR','COORDENADOR','SECRETARIA','PROFESSOR','ALUNO','ADMIN')")
    public ResponseEntity<ApiResponse<?>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(
                cursoService.listar().stream()
                        .map(CursoResponseDTO::from)
                        .toList()
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRETOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(CursoResponseDTO.from(cursoService.buscarPorId(id))));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRETOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> criar(@Valid @RequestBody CursoRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(CursoResponseDTO.from(cursoService.criar(dto)), "Curso criado."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRETOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> atualizar(@PathVariable Long id, @Valid @RequestBody CursoRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(CursoResponseDTO.from(cursoService.atualizar(id, dto)), "Curso atualizado."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRETOR','ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        cursoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/disciplinas")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> adicionarDisciplina(@PathVariable Long id, @Valid @RequestBody DisciplinaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(DisciplinaResponseDTO.from(cursoService.adicionarDisciplina(id, dto)), "Disciplina vinculada."));
    }

    @PutMapping("/{id}/coordenador")
    @PreAuthorize("hasAnyRole('DIRETOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> definirCoordenador(@PathVariable Long id, @RequestBody Long professorId) {
        return ResponseEntity.ok(ApiResponse.ok(CursoResponseDTO.from(cursoService.definirCoordenador(id, professorId)), "Coordenador atualizado."));
    }
}
