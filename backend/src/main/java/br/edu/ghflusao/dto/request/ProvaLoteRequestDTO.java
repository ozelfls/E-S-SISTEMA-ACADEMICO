package br.edu.ghflusao.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProvaLoteRequestDTO(
        @NotEmpty @Size(max = 20) List<@Valid ProvaRequestDTO> provas
) {
}
