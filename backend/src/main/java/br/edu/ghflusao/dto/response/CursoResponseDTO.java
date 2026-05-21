package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.domain.Curso;
import br.edu.ghflusao.domain.Professor;

public record CursoResponseDTO(
        Long id,
        String nome,
        Integer chTotal,
        Integer prevTerminoAnos,
        Integer limiteConclusao,
        ProfessorResumo coordenador
) {

    public static CursoResponseDTO from(Curso curso) {
        return new CursoResponseDTO(
                curso.getId(),
                curso.getNome(),
                curso.getChTotal(),
                curso.getPrevTerminoAnos(),
                curso.getLimiteConclusao(),
                ProfessorResumo.from(curso.getCoordenador())
        );
    }

    public record ProfessorResumo(
            Long id,
            String nome,
            String registro,
            String titulacao,
            String email
    ) {
        public static ProfessorResumo from(Professor professor) {
            if (professor == null) {
                return null;
            }
            return new ProfessorResumo(
                    professor.getId(),
                    professor.getNome(),
                    professor.getRegistro(),
                    professor.getTitulacao(),
                    professor.getEmail()
            );
        }
    }
}
