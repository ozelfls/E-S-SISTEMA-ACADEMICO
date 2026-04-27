package br.edu.ghflusao.domain;

import br.edu.ghflusao.enums.Turno;
import br.edu.ghflusao.enums.StatusTurma;
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
import jakarta.persistence.Convert;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "turmas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(length = 30)
    private String horario;

    @Column(nullable = false)
    private Integer vagas;

    @Column(name = "carga_horaria")
    private Integer cargaHoraria;

    @Column(nullable = false, length = 10)
    private String semestre;

    @Column(nullable = false)
    private Integer ano;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Turno turno;

    @Column(length = 20)
    private String sala;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private StatusTurma status = StatusTurma.OPEN;

    @Column(nullable = false, columnDefinition = "NUMBER(1)")
    @Convert(converter = BooleanToNumberConverter.class)
    private boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Disciplina disciplina;
}
