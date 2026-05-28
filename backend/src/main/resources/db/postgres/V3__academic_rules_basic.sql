CREATE SEQUENCE seq_aluno_matricula
    AS integer
    START WITH 100000
    INCREMENT BY 1
    MINVALUE 100000
    MAXVALUE 999999
    NO CYCLE;

SELECT setval(
    'seq_aluno_matricula',
    COALESCE((SELECT max(matricula_id) FROM alunos WHERE matricula_id BETWEEN 100000 AND 999999), 100000),
    EXISTS(SELECT 1 FROM alunos WHERE matricula_id BETWEEN 100000 AND 999999)
);

ALTER TABLE alunos
    ALTER COLUMN matricula_id SET DEFAULT nextval('seq_aluno_matricula');

ALTER TABLE alunos
    ADD CONSTRAINT chk_aluno_matricula_6_digitos
    CHECK (matricula_id BETWEEN 100000 AND 999999);

ALTER TABLE cursos
    ADD CONSTRAINT chk_curso_ch_total
    CHECK (ch_total > 0);

ALTER TABLE cursos
    ADD CONSTRAINT chk_curso_prazos
    CHECK (prev_termino_anos > 0 AND limite_conclusao >= prev_termino_anos);

ALTER TABLE disciplinas
    ADD CONSTRAINT chk_disciplina_creditos
    CHECK (creditos > 0);

ALTER TABLE disciplinas
    ADD CONSTRAINT chk_disciplina_ch
    CHECK (ch > 0);

ALTER TABLE turmas
    ADD CONSTRAINT chk_turma_ano
    CHECK (ano BETWEEN 2000 AND 2100);

ALTER TABLE provas
    ADD CONSTRAINT chk_prova_peso_max
    CHECK (peso <= 10);
