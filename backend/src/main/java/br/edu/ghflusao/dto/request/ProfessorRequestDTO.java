package br.edu.ghflusao.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record ProfessorRequestDTO(
        @NotBlank String nome,
        String cpf,
        @Email String email,
        String telefone,
        String endereco,
        LocalDate dtNascimento,
        String registro,
        String titulacao,
        String regimeTrabalho
) {
}
