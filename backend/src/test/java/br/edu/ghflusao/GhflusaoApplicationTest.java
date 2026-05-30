package br.edu.ghflusao;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GhflusaoApplicationTest {

    @Test
    void converteDatabaseUrlDoRenderParaJdbcSemCredenciaisNaUrl() {
        String jdbcUrl = GhflusaoApplication.toJdbcPostgresUrl(
                "postgresql://usuario:senha@db-interno:5432/es_sistema_academico"
        );

        assertEquals("jdbc:postgresql://db-interno:5432/es_sistema_academico", jdbcUrl);
    }

    @Test
    void preservaQueryStringDaUrlDoBanco() {
        String jdbcUrl = GhflusaoApplication.toJdbcPostgresUrl(
                "postgres://usuario:senha@db-interno:5432/es_sistema_academico?sslmode=require"
        );

        assertEquals("jdbc:postgresql://db-interno:5432/es_sistema_academico?sslmode=require", jdbcUrl);
    }

    @Test
    void rejeitaEsquemaInvalido() {
        assertThrows(IllegalArgumentException.class, () ->
                GhflusaoApplication.toJdbcPostgresUrl("mysql://usuario:senha@db:3306/app")
        );
    }
}
