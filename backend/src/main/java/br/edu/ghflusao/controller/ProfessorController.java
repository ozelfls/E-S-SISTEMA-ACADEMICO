package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.request.ProfessorRequestDTO;
import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.service.ProfessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/professores")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDENADOR','DIRETOR','SECRETARIA')")
    public ResponseEntity<ApiResponse<?>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(professorService.listar()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRETOR','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(professorService.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRETOR','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> criar(@Valid @RequestBody ProfessorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(professorService.criar(dto), "Professor cadastrado com sucesso."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRETOR','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> atualizar(@PathVariable Long id, @Valid @RequestBody ProfessorRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(professorService.atualizar(id, dto), "Professor atualizado."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRETOR','SECRETARIA','ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        professorService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
