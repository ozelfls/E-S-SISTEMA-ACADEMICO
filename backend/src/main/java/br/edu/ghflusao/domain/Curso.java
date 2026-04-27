package br.edu.ghflusao.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(name = "ch_total", nullable = false)
    private Integer chTotal;

    @Column(name = "prev_termino_anos", nullable = false)
    private Integer prevTerminoAnos;

    @Column(name = "limite_conclusao", nullable = false)
    private Integer limiteConclusao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordenador_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Professor coordenador;

    @OneToMany(mappedBy = "curso")
    @JsonIgnoreProperties({"curso", "hibernateLazyInitializer", "handler"})
    private List<Disciplina> disciplinas = new ArrayList<>();

    @OneToMany(mappedBy = "curso")
    @JsonIgnoreProperties({"curso", "hibernateLazyInitializer", "handler"})
    private List<Aluno> alunos = new ArrayList<>();
}
