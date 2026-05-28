INSERT INTO professores (id, nome, cpf, endereco, dt_nascimento, telefone, email, registro, titulacao, regime_trabalho)
VALUES
    (1, 'Ana Martins', '111.111.111-11', 'Rua Alfa, 101', DATE '1980-01-10', '(11) 90000-0001', 'ana.martins@ghflusao.edu.br', 'PROF0001', 'Mestre', '40H'),
    (2, 'Carlos Souza', '222.222.222-22', 'Rua Beta, 202', DATE '1978-03-12', '(11) 90000-0002', 'carlos.souza@ghflusao.edu.br', 'PROF0002', 'Doutor', '40H'),
    (3, 'Beatriz Lima', '333.333.333-33', 'Rua Gama, 303', DATE '1984-05-14', '(11) 90000-0003', 'beatriz.lima@ghflusao.edu.br', 'PROF0003', 'Mestre', '20H'),
    (4, 'Diego Rocha', '444.444.444-44', 'Rua Delta, 404', DATE '1982-07-16', '(11) 90000-0004', 'diego.rocha@ghflusao.edu.br', 'PROF0004', 'Especialista', '40H'),
    (5, 'Fernanda Alves', '555.555.555-55', 'Rua Epsilon, 505', DATE '1975-09-18', '(11) 90000-0005', 'fernanda.alves@ghflusao.edu.br', 'PROF0005', 'Doutor', '40H'),
    (6, 'Gustavo Pereira', '666.666.666-66', 'Rua Zeta, 606', DATE '1988-11-20', '(11) 90000-0006', 'gustavo.pereira@ghflusao.edu.br', 'PROF0006', 'Mestre', '20H'),
    (7, 'Helena Costa', '777.777.777-77', 'Rua Eta, 707', DATE '1981-02-22', '(11) 90000-0007', 'helena.costa@ghflusao.edu.br', 'PROF0007', 'Doutor', '40H'),
    (8, 'Igor Nunes', '888.888.888-88', 'Rua Theta, 808', DATE '1979-04-24', '(11) 90000-0008', 'igor.nunes@ghflusao.edu.br', 'PROF0008', 'Mestre', '40H'),
    (9, 'Juliana Castro', '999.999.999-99', 'Rua Iota, 909', DATE '1986-06-26', '(11) 90000-0009', 'juliana.castro@ghflusao.edu.br', 'PROF0009', 'Especialista', '20H'),
    (10, 'Marcos Oliveira', '101.101.101-10', 'Rua Kappa, 1001', DATE '1977-08-28', '(11) 90000-0010', 'marcos.oliveira@ghflusao.edu.br', 'PROF0010', 'Doutor', '40H');

INSERT INTO cursos (id, nome, ch_total, prev_termino_anos, limite_conclusao, coordenador_id)
VALUES
    (1, 'Sistemas de Informacao', 3200, 4, 7, 1),
    (2, 'Engenharia de Software', 3600, 4, 7, 2),
    (3, 'Ciencia da Computacao', 3400, 4, 7, 3),
    (4, 'Analise e Desenvolvimento de Sistemas', 2400, 3, 5, 4),
    (5, 'Redes de Computadores', 2800, 3, 5, 5),
    (6, 'Banco de Dados', 2400, 3, 5, 6),
    (7, 'Gestao de Tecnologia da Informacao', 2200, 3, 5, 7),
    (8, 'Seguranca da Informacao', 2600, 3, 5, 8),
    (9, 'Inteligencia Artificial', 3000, 4, 6, 9),
    (10, 'Jogos Digitais', 2600, 3, 5, 10);

INSERT INTO disciplinas (id, codigo, nome, creditos, ch, ementa, modalidade, curso_id, ativo, pre_requisito_id)
VALUES
    (1, 'MAT101', 'Calculo I', 4, 60, 'Limites, derivadas e aplicacoes.', 'PRESENCIAL', 1, 1, NULL),
    (2, 'ESW101', 'Engenharia de Software I', 4, 60, 'Processos, requisitos e modelagem.', 'PRESENCIAL', 2, 1, NULL),
    (3, 'ALG101', 'Algoritmos', 4, 80, 'Logica de programacao e estruturas basicas.', 'PRESENCIAL', 3, 1, NULL),
    (4, 'ADS101', 'Desenvolvimento Web', 4, 80, 'Aplicacoes web cliente-servidor.', 'HIBRIDA', 4, 1, 3),
    (5, 'RED101', 'Fundamentos de Redes', 4, 60, 'Modelo OSI, TCP/IP e enderecamento.', 'PRESENCIAL', 5, 1, NULL),
    (6, 'BD101', 'Modelagem de Dados', 4, 60, 'Modelo conceitual, logico e relacional.', 'PRESENCIAL', 6, 1, NULL),
    (7, 'GTI101', 'Governanca de TI', 3, 60, 'Processos, indicadores e gestao de servicos.', 'EAD', 7, 1, NULL),
    (8, 'SEG101', 'Seguranca de Sistemas', 4, 60, 'Principios de defesa e controle de acesso.', 'HIBRIDA', 8, 1, NULL),
    (9, 'IA101', 'Aprendizado de Maquina', 4, 80, 'Modelos supervisionados e avaliacao.', 'PRESENCIAL', 9, 1, 3),
    (10, 'JDG101', 'Design de Jogos', 3, 60, 'Mecanicas, narrativa e prototipacao.', 'PRESENCIAL', 10, 1, NULL);

INSERT INTO alunos (id, nome, cpf, endereco, dt_nascimento, telefone, email, matricula_id, turno, nec_especial, curso_id)
VALUES
    (1, 'Lucas Ferreira', '123.456.789-01', 'Avenida Central, 11', DATE '2002-01-15', '(21) 91000-0001', 'lucas.ferreira@aluno.ghflusao.edu.br', 100001, 'NOITE', NULL, 1),
    (2, 'Mariana Ribeiro', '123.456.789-02', 'Avenida Central, 12', DATE '2001-02-16', '(21) 91000-0002', 'mariana.ribeiro@aluno.ghflusao.edu.br', 100002, 'MANHA', NULL, 2),
    (3, 'Pedro Santos', '123.456.789-03', 'Avenida Central, 13', DATE '2003-03-17', '(21) 91000-0003', 'pedro.santos@aluno.ghflusao.edu.br', 100003, 'TARDE', NULL, 3),
    (4, 'Camila Gomes', '123.456.789-04', 'Avenida Central, 14', DATE '2000-04-18', '(21) 91000-0004', 'camila.gomes@aluno.ghflusao.edu.br', 100004, 'NOITE', NULL, 4),
    (5, 'Rafael Araujo', '123.456.789-05', 'Avenida Central, 15', DATE '2002-05-19', '(21) 91000-0005', 'rafael.araujo@aluno.ghflusao.edu.br', 100005, 'MANHA', NULL, 5),
    (6, 'Isabela Mendes', '123.456.789-06', 'Avenida Central, 16', DATE '2001-06-20', '(21) 91000-0006', 'isabela.mendes@aluno.ghflusao.edu.br', 100006, 'TARDE', NULL, 6),
    (7, 'Thiago Barros', '123.456.789-07', 'Avenida Central, 17', DATE '2003-07-21', '(21) 91000-0007', 'thiago.barros@aluno.ghflusao.edu.br', 100007, 'NOITE', NULL, 7),
    (8, 'Larissa Freitas', '123.456.789-08', 'Avenida Central, 18', DATE '2000-08-22', '(21) 91000-0008', 'larissa.freitas@aluno.ghflusao.edu.br', 100008, 'MANHA', NULL, 8),
    (9, 'Bruno Carvalho', '123.456.789-09', 'Avenida Central, 19', DATE '2002-09-23', '(21) 91000-0009', 'bruno.carvalho@aluno.ghflusao.edu.br', 100009, 'TARDE', NULL, 9),
    (10, 'Natalia Dias', '123.456.789-10', 'Avenida Central, 20', DATE '2001-10-24', '(21) 91000-0010', 'natalia.dias@aluno.ghflusao.edu.br', 100010, 'NOITE', NULL, 10);

INSERT INTO turmas (id, codigo, horario, vagas, carga_horaria, semestre, ano, turno, sala, status, ativo, professor_id, disciplina_id)
VALUES
    (1, 'MAT101-2026-1A', 'Seg 19:00', 40, 60, '2026.1', 2026, 'NOITE', 'A101', 'OPEN', 1, 1, 1),
    (2, 'ESW101-2026-1A', 'Ter 19:00', 35, 60, '2026.1', 2026, 'NOITE', 'B201', 'OPEN', 1, 2, 2),
    (3, 'ALG101-2026-1A', 'Qua 08:00', 40, 80, '2026.1', 2026, 'MANHA', 'LAB1', 'OPEN', 1, 3, 3),
    (4, 'ADS101-2026-1A', 'Qui 19:00', 30, 80, '2026.1', 2026, 'NOITE', 'LAB2', 'OPEN', 1, 4, 4),
    (5, 'RED101-2026-1A', 'Sex 08:00', 30, 60, '2026.1', 2026, 'MANHA', 'LAB3', 'OPEN', 1, 5, 5),
    (6, 'BD101-2026-1A', 'Seg 14:00', 35, 60, '2026.1', 2026, 'TARDE', 'B102', 'OPEN', 1, 6, 6),
    (7, 'GTI101-2026-1A', 'Ter 14:00', 45, 60, '2026.1', 2026, 'TARDE', 'EAD', 'OPEN', 1, 7, 7),
    (8, 'SEG101-2026-1A', 'Qua 19:00', 25, 60, '2026.1', 2026, 'NOITE', 'LAB4', 'OPEN', 1, 8, 8),
    (9, 'IA101-2026-1A', 'Qui 08:00', 25, 80, '2026.1', 2026, 'MANHA', 'LAB5', 'OPEN', 1, 9, 9),
    (10, 'JDG101-2026-1A', 'Sex 14:00', 30, 60, '2026.1', 2026, 'TARDE', 'C303', 'OPEN', 1, 10, 10);

INSERT INTO matriculas_em_turma (id, aluno_id, turma_id, dt_inscricao, situacao, frequencia, media_final, observacao)
VALUES
    (1, 1, 1, DATE '2026-02-01', 'ATIVA', 92.00, 8.20, 'Matricula regular'),
    (2, 2, 2, DATE '2026-02-01', 'ATIVA', 88.00, 7.80, 'Matricula regular'),
    (3, 3, 3, DATE '2026-02-02', 'ATIVA', 95.00, 9.10, 'Matricula regular'),
    (4, 4, 4, DATE '2026-02-02', 'ATIVA', 81.00, 7.00, 'Matricula regular'),
    (5, 5, 5, DATE '2026-02-03', 'ATIVA', 76.00, 6.40, 'Matricula regular'),
    (6, 6, 6, DATE '2026-02-03', 'ATIVA', 90.00, 8.50, 'Matricula regular'),
    (7, 7, 7, DATE '2026-02-04', 'ATIVA', 84.00, 7.60, 'Matricula regular'),
    (8, 8, 8, DATE '2026-02-04', 'ATIVA', 98.00, 9.40, 'Matricula regular'),
    (9, 9, 9, DATE '2026-02-05', 'ATIVA', 87.00, 8.00, 'Matricula regular'),
    (10, 10, 10, DATE '2026-02-05', 'ATIVA', 79.00, 6.90, 'Matricula regular');

INSERT INTO provas (id, codigo, peso, conteudo, turma_id)
VALUES
    (1, '879001', 4.00, 'Limites e derivadas.', 1),
    (2, '879002', 4.00, 'Requisitos e casos de uso.', 2),
    (3, '879003', 4.00, 'Estruturas condicionais e repeticao.', 3),
    (4, '879004', 4.00, 'HTTP, REST e formularios.', 4),
    (5, '879005', 4.00, 'Subnetting e roteamento.', 5),
    (6, '879006', 4.00, 'Modelo entidade-relacionamento.', 6),
    (7, '879007', 4.00, 'Indicadores e governanca.', 7),
    (8, '879008', 4.00, 'Autenticacao e autorizacao.', 8),
    (9, '879009', 4.00, 'Regressao e classificacao.', 9),
    (10, '879010', 4.00, 'Mecanicas e balanceamento.', 10);

INSERT INTO resultados_prova (id, matricula_id, prova_id, nota, presente, data_realizacao, duracao_min)
VALUES
    (1, 1, 1, 8.20, 1, DATE '2026-03-20', 90),
    (2, 2, 2, 7.80, 1, DATE '2026-03-21', 90),
    (3, 3, 3, 9.10, 1, DATE '2026-03-22', 100),
    (4, 4, 4, 7.00, 1, DATE '2026-03-23', 100),
    (5, 5, 5, 6.40, 1, DATE '2026-03-24', 90),
    (6, 6, 6, 8.50, 1, DATE '2026-03-25', 90),
    (7, 7, 7, 7.60, 1, DATE '2026-03-26', 80),
    (8, 8, 8, 9.40, 1, DATE '2026-03-27', 90),
    (9, 9, 9, 8.00, 1, DATE '2026-03-28', 100),
    (10, 10, 10, 6.90, 1, DATE '2026-03-29', 80);

INSERT INTO usuarios_sistema (id, login, senha_hash, perfil, pessoa_id, ativo)
VALUES
    (1, 'funnyValentine', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ADMIN', NULL, true),
    (2, 'blankspace', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ADMIN', NULL, true),
    (3, 'secretaria', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'SECRETARIA', NULL, true),
    (4, 'diretor', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'DIRETOR', NULL, true),
    (5, 'ana.coord', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'COORDENADOR', 1, true),
    (6, 'carlos.prof', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'PROFESSOR', 2, true),
    (7, 'beatriz.prof', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'PROFESSOR', 3, true),
    (8, '100001', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 1, true),
    (9, '100002', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 2, true),
    (10, '100003', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 3, true);

SELECT setval(pg_get_serial_sequence('professores', 'id'), (SELECT max(id) FROM professores));
SELECT setval(pg_get_serial_sequence('cursos', 'id'), (SELECT max(id) FROM cursos));
SELECT setval(pg_get_serial_sequence('disciplinas', 'id'), (SELECT max(id) FROM disciplinas));
SELECT setval(pg_get_serial_sequence('alunos', 'id'), (SELECT max(id) FROM alunos));
SELECT setval(pg_get_serial_sequence('turmas', 'id'), (SELECT max(id) FROM turmas));
SELECT setval(pg_get_serial_sequence('matriculas_em_turma', 'id'), (SELECT max(id) FROM matriculas_em_turma));
SELECT setval(pg_get_serial_sequence('provas', 'id'), (SELECT max(id) FROM provas));
SELECT setval(pg_get_serial_sequence('resultados_prova', 'id'), (SELECT max(id) FROM resultados_prova));
SELECT setval(pg_get_serial_sequence('usuarios_sistema', 'id'), (SELECT max(id) FROM usuarios_sistema));
