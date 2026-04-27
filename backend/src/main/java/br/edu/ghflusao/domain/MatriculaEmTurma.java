package br.edu.ghflusao.domain;

import br.edu.ghflusao.enums.Situacao;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "matriculas_em_turma")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaEmTurma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Turma turma;

    @Column(name = "dt_inscricao", nullable = false)
    private LocalDate dtInscricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private Situacao situacao = Situacao.ATIVA;

    @Column(nullable = false)
    private Double frequencia = 0.0;

    @Column(name = "media_final")
    private Double mediaFinal;

    @Column(length = 500)
    private String observacao;
}
