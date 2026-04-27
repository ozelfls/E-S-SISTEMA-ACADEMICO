INSERT INTO usuarios_sistema (login, senha_hash, perfil)
VALUES ('secretaria', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'SECRETARIA');

INSERT INTO usuarios_sistema (login, senha_hash, perfil)
VALUES ('diretor', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'DIRETOR');

INSERT INTO usuarios_sistema (login, senha_hash, perfil)
VALUES ('ana.coord', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'COORDENADOR');

INSERT INTO usuarios_sistema (login, senha_hash, perfil)
VALUES ('carlos.prof', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'PROFESSOR');

INSERT INTO usuarios_sistema (login, senha_hash, perfil)
VALUES ('1015620', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh32', 'ALUNO');

INSERT INTO cursos (nome, ch_total, prev_termino_anos, limite_conclusao)
VALUES ('Sistemas de Informação', 3200, 4, 7);

INSERT INTO disciplinas (codigo, nome, creditos, ch, modalidade, curso_id)
VALUES ('MAT101', 'Cálculo I', 4, 60, 'PRESENCIAL', 1);

INSERT INTO disciplinas (codigo, nome, creditos, ch, modalidade, curso_id)
VALUES ('ENG201', 'Engenharia de Software I', 4, 60, 'PRESENCIAL', 1);

INSERT INTO disciplinas (codigo, nome, creditos, ch, modalidade, curso_id)
VALUES ('ENG202', 'Engenharia de Software II', 4, 60, 'PRESENCIAL', 1);

UPDATE disciplinas
SET pre_requisito_id = 2
WHERE codigo = 'ENG202';

COMMIT;
