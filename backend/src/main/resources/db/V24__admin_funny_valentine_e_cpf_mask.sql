UPDATE alunos
SET cpf = REGEXP_REPLACE(
    REGEXP_REPLACE(cpf, '[^0-9]', ''),
    '([0-9]{3})([0-9]{3})([0-9]{3})([0-9]{2})',
    '\1.\2.\3-\4'
)
WHERE REGEXP_LIKE(REGEXP_REPLACE(cpf, '[^0-9]', ''), '^[0-9]{11}$');

UPDATE professores
SET cpf = REGEXP_REPLACE(
    REGEXP_REPLACE(cpf, '[^0-9]', ''),
    '([0-9]{3})([0-9]{3})([0-9]{3})([0-9]{2})',
    '\1.\2.\3-\4'
)
WHERE REGEXP_LIKE(REGEXP_REPLACE(cpf, '[^0-9]', ''), '^[0-9]{11}$');

COMMIT;
