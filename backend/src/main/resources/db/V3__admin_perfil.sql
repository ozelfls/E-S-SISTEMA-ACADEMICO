DECLARE
BEGIN
   FOR c IN (
      SELECT constraint_name
      FROM user_constraints
      WHERE table_name = 'USUARIOS_SISTEMA'
        AND constraint_type = 'C'
        AND UPPER(search_condition_vc) LIKE '%PERFIL%IN%'
   ) LOOP
      EXECUTE IMMEDIATE 'ALTER TABLE usuarios_sistema DROP CONSTRAINT ' || c.constraint_name;
   END LOOP;
END;
/

DECLARE
   v_len NUMBER;
BEGIN
   SELECT data_length INTO v_len
   FROM user_tab_columns
   WHERE table_name = 'USUARIOS_SISTEMA' AND column_name = 'PERFIL';
   IF v_len < 15 THEN
      EXECUTE IMMEDIATE 'ALTER TABLE usuarios_sistema MODIFY (perfil VARCHAR2(15))';
   END IF;
END;
/

ALTER TABLE usuarios_sistema
   ADD CONSTRAINT chk_usuarios_perfil
   CHECK (perfil IN ('SECRETARIA','DIRETOR','COORDENADOR','PROFESSOR','ALUNO','ADMIN'));

UPDATE usuarios_sistema SET perfil = 'ADMIN' WHERE login = 'blankspace';

COMMIT;
