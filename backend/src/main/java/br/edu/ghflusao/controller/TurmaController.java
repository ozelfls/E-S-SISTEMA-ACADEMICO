package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.request.AlocarProfessorRequestDTO;
import br.edu.ghflusao.dto.request.ProvaLoteRequestDTO;
import br.edu.ghflusao.dto.request.ProvaRequestDTO;
import br.edu.ghflusao.dto.request.TurmaRequestDTO;
import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.dto.response.MatriculaEmTurmaResponseDTO;
import br.edu.ghflusao.dto.response.ProvaResponseDTO;
import br.edu.ghflusao.dto.response.TurmaResponseDTO;
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
    @PreAuthorize("hasAnyRole('ALUNO','PROFESSOR','COORDENADOR','SECRETARIA','ADMIN')")
    public ResponseEntity<ApiResponse<?>> listar(
            @RequestParam(required = false) String semestre,
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Long cursoId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(turmaService.listar(semestre, ano, cursoId).stream()
                .map(TurmaResponseDTO::from)
                .toList()));
    }

    @GetMapping("/turmas/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(TurmaResponseDTO.from(turmaService.buscarPorId(id))));
    }

    @PostMapping("/disciplinas/{id}/turmas")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> criarTurma(@PathVariable Long id, @Valid @RequestBody TurmaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(TurmaResponseDTO.from(turmaService.criarTurma(id, dto)), "Turma criada com sucesso."));
    }

    @PutMapping("/turmas/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> atualizar(@PathVariable Long id, @Valid @RequestBody TurmaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(TurmaResponseDTO.from(turmaService.atualizar(id, dto)), "Turma atualizada."));
    }

    @PutMapping("/turmas/{id}/professor")
    @PreAuthorize("hasAnyRole('COORDENADOR','DIRETOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> alocarProfessor(@PathVariable Long id, @RequestBody AlocarProfessorRequestDTO dto) {
        Long professorId = dto != null ? dto.professorId() : null;
        String message = professorId != null ? "Professor alocado com sucesso." : "Professor desalocado com sucesso.";
        return ResponseEntity.ok(ApiResponse.ok(TurmaResponseDTO.from(turmaService.alocarProfessor(id, professorId)), message));
    }

    @DeleteMapping("/turmas/{id}")
    @PreAuthorize("hasAnyRole('COORDENADOR','ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        turmaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/turmas/{id}/provas")
    @PreAuthorize("hasAnyRole('PROFESSOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> cadastrarProva(@PathVariable Long id, @Valid @RequestBody ProvaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(ProvaResponseDTO.from(provaService.cadastrarProva(id, dto)), "Prova cadastrada."));
    }

    @PostMapping("/turmas/{id}/provas/lote")
    @PreAuthorize("hasAnyRole('PROFESSOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> cadastrarProvas(@PathVariable Long id, @Valid @RequestBody ProvaLoteRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(
                provaService.cadastrarProvas(id, dto.provas()).stream()
                        .map(ProvaResponseDTO::from)
                        .toList(),
                "Provas cadastradas."
        ));
    }

    @GetMapping("/turmas/{id}/alunos")
    @PreAuthorize("hasAnyRole('PROFESSOR','COORDENADOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> listarAlunos(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(turmaService.listarAlunosDaTurma(id).stream()
                .map(MatriculaEmTurmaResponseDTO::from)
                .toList()));
    }
}
