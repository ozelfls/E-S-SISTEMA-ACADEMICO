package br.edu.ghflusao.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "professores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Professor extends Pessoa {

    @Column(unique = true, length = 20)
    private String registro;

    @Column(length = 60)
    private String titulacao;

    @Column(name = "regime_trabalho", length = 10)
    private String regimeTrabalho;
}
