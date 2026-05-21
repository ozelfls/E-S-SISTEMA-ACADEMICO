ALTER TABLE provas ADD (conteudo_clob CLOB);

UPDATE provas
SET conteudo_clob = TO_CLOB(conteudo)
WHERE conteudo IS NOT NULL;

ALTER TABLE provas DROP COLUMN conteudo;

ALTER TABLE provas RENAME COLUMN conteudo_clob TO conteudo;
