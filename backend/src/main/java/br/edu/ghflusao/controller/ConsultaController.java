package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.service.ConsultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/consultas")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','DIRETOR','SECRETARIA','COORDENADOR')")
public class ConsultaController {

    private final ConsultaService consultaService;

    @GetMapping("/professores/{id}/turmas")
    public ResponseEntity<ApiResponse<?>> turmasDoProfessor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(consultaService.turmasDoProfessor(id)));
    }

    @GetMapping("/alunos/{id}/trajetoria")
    public ResponseEntity<ApiResponse<?>> trajetoriaAluno(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(consultaService.trajetoriaAluno(id)));
    }

    @GetMapping("/turmas/{id}/detalhes")
    public ResponseEntity<ApiResponse<?>> detalhesTurma(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(consultaService.detalhesTurma(id)));
    }

    @GetMapping("/disciplinas/{id}/historico")
    public ResponseEntity<ApiResponse<?>> historicoDisciplina(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(consultaService.historicoDisciplina(id)));
    }

    @GetMapping("/semestre")
    public ResponseEntity<ApiResponse<?>> snapshotSemestre(
            @RequestParam String semestre,
            @RequestParam Integer ano
    ) {
        return ResponseEntity.ok(ApiResponse.ok(consultaService.snapshotSemestre(semestre, ano)));
    }

    @GetMapping("/buscar")
    public ResponseEntity<ApiResponse<?>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(consultaService.buscar(q)));
    }

    @GetMapping("/relatorio-academico")
    public ResponseEntity<ApiResponse<?>> relatorioAcademico() {
        return ResponseEntity.ok(ApiResponse.ok(consultaService.relatorioAcademico()));
    }
}
