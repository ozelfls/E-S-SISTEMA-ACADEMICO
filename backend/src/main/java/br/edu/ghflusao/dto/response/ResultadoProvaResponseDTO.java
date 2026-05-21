package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.domain.ResultadoProva;

import java.time.LocalDate;

public record ResultadoProvaResponseDTO(
        Long id,
        Double nota,
        Boolean presente,
        LocalDate dataRealizacao,
        Integer duracaoMin,
        Long provaId,
        String provaCodigo,
        Long matriculaId
) {
    public static ResultadoProvaResponseDTO from(ResultadoProva resultado) {
        return new ResultadoProvaResponseDTO(
                resultado.getId(),
                resultado.getNota(),
                resultado.getPresente(),
                resultado.getDataRealizacao(),
                resultado.getDuracaoMin(),
                resultado.getProva() != null ? resultado.getProva().getId() : null,
                resultado.getProva() != null ? resultado.getProva().getCodigo() : null,
                resultado.getMatricula() != null ? resultado.getMatricula().getId() : null
        );
    }
}
