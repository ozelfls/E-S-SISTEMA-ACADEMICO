package br.edu.ghflusao.dto.response;

import br.edu.ghflusao.domain.AuditoriaResultado;
import br.edu.ghflusao.enums.Perfil;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AuditoriaResultadoDTO(
        Long id,
        Long resultadoId,
        Long provaId,
        Long turmaId,
        Long matriculaId,
        Long alunoId,
        Double notaAnterior,
        Double notaNova,
        Boolean presenteAnterior,
        Boolean presenteNovo,
        LocalDate dataAnterior,
        LocalDate dataNova,
        Integer duracaoAnterior,
        Integer duracaoNova,
        String usuarioLogin,
        Perfil usuarioPerfil,
        String motivo,
        LocalDateTime alteradoEm
) {
    public static AuditoriaResultadoDTO from(AuditoriaResultado auditoria) {
        return new AuditoriaResultadoDTO(
                auditoria.getId(),
                auditoria.getResultado().getId(),
                auditoria.getProvaId(),
                auditoria.getTurmaId(),
                auditoria.getMatriculaId(),
                auditoria.getAlunoId(),
                auditoria.getNotaAnterior(),
                auditoria.getNotaNova(),
                auditoria.getPresenteAnterior(),
                auditoria.getPresenteNovo(),
                auditoria.getDataAnterior(),
                auditoria.getDataNova(),
                auditoria.getDuracaoAnterior(),
                auditoria.getDuracaoNova(),
                auditoria.getUsuarioLogin(),
                auditoria.getUsuarioPerfil(),
                auditoria.getMotivo(),
                auditoria.getAlteradoEm()
        );
    }
}
