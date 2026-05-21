package br.edu.ghflusao.controller;

import br.edu.ghflusao.dto.response.ApiResponse;
import br.edu.ghflusao.service.ProvaImportacaoService;
import br.edu.ghflusao.service.ProvaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/provas")
@RequiredArgsConstructor
public class ProvaController {

    private final ProvaService provaService;
    private final ProvaImportacaoService provaImportacaoService;

    @GetMapping("/{codigo}/lancamento")
    @PreAuthorize("hasAnyRole('PROFESSOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscarParaLancamento(@PathVariable String codigo) {
        return ResponseEntity.ok(ApiResponse.ok(provaService.buscarParaLancamento(codigo)));
    }

    @PostMapping("/importar-arquivo")
    @PreAuthorize("hasAnyRole('PROFESSOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> importarArquivo(@RequestParam("arquivo") MultipartFile arquivo) {
        return ResponseEntity.ok(ApiResponse.ok(provaImportacaoService.importar(arquivo), "Arquivo convertido."));
    }
}
