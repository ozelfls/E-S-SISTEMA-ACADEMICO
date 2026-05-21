package br.edu.ghflusao.dto.response;

import java.util.List;

public record ProvaImportacaoDTO(
        String titulo,
        String instrucoes,
        List<QuestaoImportada> questoes
) {
    public record QuestaoImportada(
            String tipo,
            String enunciado,
            Double pontos,
            List<String> alternativas,
            String resposta
    ) {
    }
}
