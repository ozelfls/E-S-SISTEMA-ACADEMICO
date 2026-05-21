DECLARE
    v_total NUMBER;
    v_next NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM alunos;

    IF v_total > 900000 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Limite de matriculas de 6 digitos atingido.');
    END IF;

    UPDATE alunos
       SET matricula_id = -id;

    MERGE INTO alunos a
    USING (
        SELECT id,
               99999 + ROW_NUMBER() OVER (ORDER BY id) AS nova_matricula
          FROM alunos
    ) src
    ON (a.id = src.id)
    WHEN MATCHED THEN
        UPDATE SET a.matricula_id = src.nova_matricula;

    SELECT NVL(MAX(matricula_id), 99999) + 1 INTO v_next FROM alunos;

    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_aluno_matricula';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE != -2289 THEN
                RAISE;
            END IF;
    END;

    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_aluno_matricula START WITH ' || v_next || ' INCREMENT BY 1 NOCACHE';
END;
/

CREATE OR REPLACE TRIGGER trg_aluno_matricula_auto
    BEFORE INSERT ON alunos
    FOR EACH ROW
DECLARE
    v_next NUMBER;
BEGIN
    IF :NEW.matricula_id IS NULL THEN
        v_next := seq_aluno_matricula.NEXTVAL;
        IF v_next > 999999 THEN
            RAISE_APPLICATION_ERROR(-20001, 'Limite de matriculas de 6 digitos atingido.');
        END IF;
        :NEW.matricula_id := v_next;
    END IF;
END;
/
