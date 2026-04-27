package br.edu.ghflusao.dto.request;

import br.edu.ghflusao.enums.Turno;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AlunoCreateDTO(
        @NotBlank String nome,
        @NotBlank String cpf,
        Integer matriculaId,
        @NotNull Turno turno,
        @NotNull Long cursoId,
        @Email String email
) {
}
