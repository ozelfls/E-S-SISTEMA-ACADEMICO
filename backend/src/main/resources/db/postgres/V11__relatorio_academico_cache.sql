CREATE TABLE relatorio_academico_cache (
    cache_id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    aluno_id                    bigint,
    aluno_nome                  varchar(180),
    aluno_matricula             bigint,
    aluno_email                 varchar(180),
    aluno_turno                 varchar(20),
    curso_id                    bigint,
    curso_nome                  varchar(180),
    curso_ch_total              integer,
    disciplina_id               bigint,
    disciplina_codigo           varchar(40),
    disciplina_nome             varchar(180),
    disciplina_ch               integer,
    disciplina_modalidade       varchar(20),
    turma_id                    bigint,
    turma_codigo                varchar(40),
    turma_turno                 varchar(20),
    turma_semestre              varchar(20),
    turma_ano                   integer,
    turma_sala                  varchar(80),
    turma_horario               varchar(180),
    turma_vagas                 integer,
    professor_id                bigint,
    professor_nome              varchar(180),
    professor_email             varchar(180),
    professor_titulacao         varchar(120),
    matricula_id                bigint,
    matricula_data              date,
    matricula_situacao          varchar(20),
    matricula_frequencia        numeric(5, 2),
    matricula_media_final       numeric(4, 2),
    prova_id                    bigint,
    prova_codigo                varchar(40),
    prova_peso                  numeric(4, 2),
    prova_conteudo              varchar(500),
    resultado_id                bigint,
    resultado_nota              numeric(4, 2),
    resultado_presente          smallint,
    resultado_data_realizacao   date,
    resultado_duracao_min       integer
);

CREATE INDEX idx_rel_acad_aluno ON relatorio_academico_cache (aluno_id);
CREATE INDEX idx_rel_acad_turma ON relatorio_academico_cache (turma_id);
CREATE INDEX idx_rel_acad_matricula ON relatorio_academico_cache (matricula_id);
CREATE INDEX idx_rel_acad_prova ON relatorio_academico_cache (prova_id);
CREATE UNIQUE INDEX uq_rel_acad_matricula_prova
    ON relatorio_academico_cache (matricula_id, prova_id) NULLS NOT DISTINCT;

CREATE OR REPLACE FUNCTION refresh_relatorio_academico_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM relatorio_academico_cache;

    INSERT INTO relatorio_academico_cache (
        aluno_id,
        aluno_nome,
        aluno_matricula,
        aluno_email,
        aluno_turno,
        curso_id,
        curso_nome,
        curso_ch_total,
        disciplina_id,
        disciplina_codigo,
        disciplina_nome,
        disciplina_ch,
        disciplina_modalidade,
        turma_id,
        turma_codigo,
        turma_turno,
        turma_semestre,
        turma_ano,
        turma_sala,
        turma_horario,
        turma_vagas,
        professor_id,
        professor_nome,
        professor_email,
        professor_titulacao,
        matricula_id,
        matricula_data,
        matricula_situacao,
        matricula_frequencia,
        matricula_media_final,
        prova_id,
        prova_codigo,
        prova_peso,
        prova_conteudo,
        resultado_id,
        resultado_nota,
        resultado_presente,
        resultado_data_realizacao,
        resultado_duracao_min
    )
    SELECT
        a.id,
        a.nome,
        a.matricula_id,
        a.email,
        a.turno,
        c.id,
        c.nome,
        c.ch_total,
        d.id,
        d.codigo,
        d.nome,
        d.ch,
        d.modalidade,
        t.id,
        t.codigo,
        t.turno,
        t.semestre,
        t.ano,
        t.sala,
        t.horario,
        t.vagas,
        p.id,
        p.nome,
        p.email,
        p.titulacao,
        m.id,
        m.dt_inscricao,
        m.situacao,
        m.frequencia,
        m.media_final,
        pr.id,
        pr.codigo,
        pr.peso,
        substring(pr.conteudo from 1 for 500),
        r.id,
        r.nota,
        r.presente,
        r.data_realizacao,
        r.duracao_min
    FROM matriculas_em_turma m
    LEFT JOIN alunos a ON a.id = m.aluno_id
    LEFT JOIN turmas t ON t.id = m.turma_id
    LEFT JOIN disciplinas d ON d.id = t.disciplina_id
    LEFT JOIN cursos c ON c.id = COALESCE(d.curso_id, a.curso_id)
    LEFT JOIN professores p ON p.id = t.professor_id
    LEFT JOIN provas pr ON pr.turma_id = t.id
    LEFT JOIN resultados_prova r ON r.matricula_id = m.id AND r.prova_id = pr.id;
END;
$$;

SELECT refresh_relatorio_academico_cache();
