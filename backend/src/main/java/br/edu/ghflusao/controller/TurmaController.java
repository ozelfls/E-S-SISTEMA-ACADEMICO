package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.request.AlocarProfessorRequestDTO;
import br.edu.ghflusao.dto.request.ProvaRequestDTO;
import br.edu.ghflusao.dto.request.TurmaRequestDTO;
import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.service.ProvaService;
import br.edu.ghflusao.service.TurmaService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TurmaController {

    private final TurmaService turmaService;
    private final ProvaService provaService;

    @GetMapping("/turmas")
    @PreAuthorize("hasAnyRole('ALUNO','PROFESSOR','COORDENADOR','SECRETARIA')")
    public ResponseEntity<ApiResponse<?>> listar(
            @RequestParam(required = false) String semestre,
            @RequestParam(required = false) Integer ano
    ) {
        return ResponseEntity.ok(ApiResponse.ok(turmaService.listar(semestre, ano)));
    }

    @GetMapping("/turmas/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(turmaService.buscarPorId(id)));
    }

    @PostMapping("/disciplinas/{id}/turmas")
    @PreAuthorize("hasRole('COORDENADOR')")
    public ResponseEntity<ApiResponse<?>> criarTurma(@PathVariable Long id, @Valid @RequestBody TurmaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(turmaService.criarTurma(id, dto), "Turma criada com sucesso."));
    }

    @PutMapping("/turmas/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> atualizar(@PathVariable Long id, @Valid @RequestBody TurmaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(turmaService.atualizar(id, dto), "Turma atualizada."));
    }

    @PutMapping("/turmas/{id}/professor")
    @PreAuthorize("hasAnyRole('COORDENADOR','DIRETOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> alocarProfessor(@PathVariable Long id, @RequestBody AlocarProfessorRequestDTO dto) {
        Long professorId = dto != null ? dto.professorId() : null;
        String message = professorId != null ? "Professor alocado com sucesso." : "Professor desalocado com sucesso.";
        return ResponseEntity.ok(ApiResponse.ok(turmaService.alocarProfessor(id, professorId), message));
    }

    @DeleteMapping("/turmas/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        turmaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/turmas/{id}/provas")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<?>> cadastrarProva(@PathVariable Long id, @Valid @RequestBody ProvaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(provaService.cadastrarProva(id, dto), "Prova cadastrada."));
    }

    @GetMapping("/turmas/{id}/alunos")
    @PreAuthorize("hasAnyRole('PROFESSOR','COORDENADOR')")
    public ResponseEntity<ApiResponse<?>> listarAlunos(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(turmaService.listarAlunosDaTurma(id)));
    }
}
