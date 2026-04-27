package br.edu.ghflusao.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ResultadoRequestDTO(
        @NotNull @Min(0) @Max(10) Double nota,
        @NotNull Boolean presente,
        LocalDate data,
        Integer duracao
) {
}
