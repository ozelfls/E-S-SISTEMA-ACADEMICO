DECLARE
    v_max NUMBER;
BEGIN
    SELECT NVL(MAX(matricula_id), 1000000) + 1 INTO v_max FROM alunos;
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_aluno_matricula START WITH ' || v_max || ' INCREMENT BY 1 NOCACHE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_aluno_matricula_auto
    BEFORE INSERT ON alunos
    FOR EACH ROW
BEGIN
    IF :NEW.matricula_id IS NULL THEN
        :NEW.matricula_id := seq_aluno_matricula.NEXTVAL;
    END IF;
END;
/

ALTER TABLE turmas ADD (
    status VARCHAR2(15) DEFAULT 'OPEN' NOT NULL,
    carga_horaria NUMBER(4),
    ativo NUMBER(1) DEFAULT 1 NOT NULL
);

ALTER TABLE disciplinas ADD (
    ativo NUMBER(1) DEFAULT 1 NOT NULL
);

ALTER TABLE matriculas_em_turma ADD (
    media_final NUMBER(4,2)
);

ALTER TABLE turmas ADD CONSTRAINT chk_turma_status
    CHECK (status IN ('OPEN','IN_PROGRESS','CLOSED'));
ALTER TABLE turmas ADD CONSTRAINT chk_turma_ativo
    CHECK (ativo IN (0,1));
ALTER TABLE disciplinas ADD CONSTRAINT chk_disciplina_ativo
    CHECK (ativo IN (0,1));
ALTER TABLE matriculas_em_turma ADD CONSTRAINT chk_media_final
    CHECK (media_final IS NULL OR media_final BETWEEN 0 AND 10);

UPDATE turmas t
SET t.carga_horaria = (
    SELECT d.ch
    FROM disciplinas d
    WHERE d.id = t.disciplina_id
)
WHERE t.carga_horaria IS NULL;

COMMIT;
