package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.request.DisciplinaRequestDTO;
import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.service.DisciplinaService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/disciplinas")
@RequiredArgsConstructor
public class DisciplinaController {

    private final DisciplinaService disciplinaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ALUNO','PROFESSOR','COORDENADOR','SECRETARIA','DIRETOR')")
    public ResponseEntity<ApiResponse<?>> listar(@RequestParam(required = false) Long cursoId) {
        if (cursoId != null) {
            return ResponseEntity.ok(ApiResponse.ok(disciplinaService.listarPorCurso(cursoId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(disciplinaService.listar()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(disciplinaService.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> criar(@Valid @RequestBody DisciplinaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(disciplinaService.criar(dto), "Disciplina criada com sucesso."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> atualizar(@PathVariable Long id, @Valid @RequestBody DisciplinaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(disciplinaService.atualizar(id, dto), "Disciplina atualizada."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        disciplinaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
