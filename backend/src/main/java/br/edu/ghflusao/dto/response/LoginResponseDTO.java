package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.enums.Perfil;

public record LoginResponseDTO(
        String token,
        Perfil perfil,
        Long pessoaId,
        String nome
) {
}
