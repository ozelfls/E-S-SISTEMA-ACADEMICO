package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.request.ResultadoRequestDTO;
import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.dto.response.ResultadoProvaResponseDTO;
import br.edu.ghflusao.service.ProvaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/resultados")
@RequiredArgsConstructor
public class ResultadoController {

    private final ProvaService provaService;

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROFESSOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> lancar(@PathVariable Long id, @Valid @RequestBody ResultadoRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(
                ResultadoProvaResponseDTO.from(provaService.lancarResultado(id, dto)),
                "Resultado atualizado."
        ));
    }

    @GetMapping("/{id}/auditoria")
    @PreAuthorize("hasAnyRole('PROFESSOR','COORDENADOR','DIRETOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> auditoria(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(provaService.listarAuditoriaResultado(id)));
    }
}
