package br.edu.ghflusao.domain;

import br.edu.ghflusao.enums.Perfil;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_resultados")
@Getter
@Setter
public class AuditoriaResultado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resultado_id", nullable = false)
    private ResultadoProva resultado;

    @Column(name = "prova_id", nullable = false)
    private Long provaId;

    @Column(name = "turma_id", nullable = false)
    private Long turmaId;

    @Column(name = "matricula_id", nullable = false)
    private Long matriculaId;

    @Column(name = "aluno_id", nullable = false)
    private Long alunoId;

    @Column(name = "nota_anterior")
    private Double notaAnterior;

    @Column(name = "nota_nova")
    private Double notaNova;

    @Column(name = "presente_anterior")
    @Convert(converter = BooleanToNumberConverter.class)
    private Boolean presenteAnterior;

    @Column(name = "presente_novo")
    @Convert(converter = BooleanToNumberConverter.class)
    private Boolean presenteNovo;

    @Column(name = "data_anterior")
    private LocalDate dataAnterior;

    @Column(name = "data_nova")
    private LocalDate dataNova;

    @Column(name = "duracao_anterior")
    private Integer duracaoAnterior;

    @Column(name = "duracao_nova")
    private Integer duracaoNova;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "usuario_login", length = 80)
    private String usuarioLogin;

    @Enumerated(EnumType.STRING)
    @Column(name = "usuario_perfil", length = 15)
    private Perfil usuarioPerfil;

    @Column(length = 500)
    private String motivo;

    @Column(name = "alterado_em", nullable = false)
    private LocalDateTime alteradoEm;
}
