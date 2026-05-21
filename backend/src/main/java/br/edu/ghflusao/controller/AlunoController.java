package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.request.AlunoCreateDTO;
import br.edu.ghflusao.dto.request.MatriculaRequestDTO;
import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.dto.response.MatriculaEmTurmaResponseDTO;
import br.edu.ghflusao.service.AlunoService;
import br.edu.ghflusao.service.MatriculaService;
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
@RequestMapping("/alunos")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;
    private final MatriculaService matriculaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> criar(@Valid @RequestBody AlunoCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(alunoService.criar(dto), "Aluno cadastrado com sucesso."));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(alunoService.listar()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(alunoService.buscarPorId(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> atualizar(@PathVariable Long id, @Valid @RequestBody AlunoCreateDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(alunoService.atualizar(id, dto), "Aluno atualizado."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SECRETARIA','ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        alunoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/historico")
    @PreAuthorize("hasAnyRole('ALUNO','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> historico(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(matriculaService.getHistorico(id).stream()
                .map(MatriculaEmTurmaResponseDTO::from)
                .toList()));
    }

    @PostMapping("/{id}/matriculas")
    @PreAuthorize("hasAnyRole('ALUNO','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> matricular(@PathVariable Long id, @Valid @RequestBody MatriculaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(
                MatriculaEmTurmaResponseDTO.from(matriculaService.matricularAluno(id, dto.turmaId())),
                "Matricula realizada."
        ));
    }

    @PostMapping("/{id}/matriculas/alocacao-automatica")
    @PreAuthorize("hasAnyRole('SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> alocacaoAutomatica(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(matriculaService.alocarAutomaticamente(id), "Alocacao automatica concluida."));
    }

    @GetMapping("/{id}/matriculas/opcoes")
    @PreAuthorize("hasAnyRole('ALUNO','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> opcoesMatricula(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(matriculaService.listarOpcoesMatricula(id)));
    }

    @GetMapping("/{id}/matriculas/{turmaId}/analise")
    @PreAuthorize("hasAnyRole('ALUNO','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> analisarMatricula(@PathVariable Long id, @PathVariable Long turmaId) {
        return ResponseEntity.ok(ApiResponse.ok(matriculaService.analisarMatricula(id, turmaId)));
    }

    @GetMapping("/{id}/turmas-ativas")
    @PreAuthorize("hasAnyRole('ALUNO','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> turmasAtivas(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(matriculaService.getTurmasAtivas(id).stream()
                .map(MatriculaEmTurmaResponseDTO::from)
                .toList()));
    }
}
