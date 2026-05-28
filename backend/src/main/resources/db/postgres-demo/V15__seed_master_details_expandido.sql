-- Expande a base demo para exercitar Master Details, paginacao e analises.
-- A carga adiciona 20 registros relacionados em cada tabela principal.

INSERT INTO professores (id, nome, cpf, endereco, dt_nascimento, telefone, email, registro, titulacao, regime_trabalho)
VALUES
    (11, 'Paula Menezes', '211.111.111-11', 'Rua Lambda, 1101', DATE '1983-01-11', '(11) 90000-0011', 'paula.menezes@ghflusao.edu.br', 'PROF0011', 'Mestre', '40H'),
    (12, 'Ricardo Teixeira', '212.222.222-12', 'Rua Mu, 1202', DATE '1976-02-12', '(11) 90000-0012', 'ricardo.teixeira@ghflusao.edu.br', 'PROF0012', 'Doutor', '40H'),
    (13, 'Simone Batista', '213.333.333-13', 'Rua Nu, 1303', DATE '1985-03-13', '(11) 90000-0013', 'simone.batista@ghflusao.edu.br', 'PROF0013', 'Especialista', '20H'),
    (14, 'Andre Moreira', '214.444.444-14', 'Rua Xi, 1404', DATE '1981-04-14', '(11) 90000-0014', 'andre.moreira@ghflusao.edu.br', 'PROF0014', 'Mestre', '40H'),
    (15, 'Renata Fonseca', '215.555.555-15', 'Rua Omicron, 1505', DATE '1979-05-15', '(11) 90000-0015', 'renata.fonseca@ghflusao.edu.br', 'PROF0015', 'Doutor', '40H'),
    (16, 'Otavio Campos', '216.666.666-16', 'Rua Pi, 1606', DATE '1987-06-16', '(11) 90000-0016', 'otavio.campos@ghflusao.edu.br', 'PROF0016', 'Mestre', '20H'),
    (17, 'Marta Siqueira', '217.777.777-17', 'Rua Rho, 1707', DATE '1980-07-17', '(11) 90000-0017', 'marta.siqueira@ghflusao.edu.br', 'PROF0017', 'Doutor', '40H'),
    (18, 'Leandro Pires', '218.888.888-18', 'Rua Sigma, 1808', DATE '1982-08-18', '(11) 90000-0018', 'leandro.pires@ghflusao.edu.br', 'PROF0018', 'Mestre', '40H'),
    (19, 'Tatiana Reis', '219.999.999-19', 'Rua Tau, 1909', DATE '1984-09-19', '(11) 90000-0019', 'tatiana.reis@ghflusao.edu.br', 'PROF0019', 'Especialista', '20H'),
    (20, 'Vitor Almeida', '220.101.101-20', 'Rua Upsilon, 2001', DATE '1977-10-20', '(11) 90000-0020', 'vitor.almeida@ghflusao.edu.br', 'PROF0020', 'Doutor', '40H'),
    (21, 'Daniela Prado', '221.111.111-21', 'Rua Phi, 2101', DATE '1986-11-21', '(11) 90000-0021', 'daniela.prado@ghflusao.edu.br', 'PROF0021', 'Mestre', '40H'),
    (22, 'Eduardo Martins', '222.222.222-23', 'Rua Chi, 2202', DATE '1978-12-22', '(11) 90000-0022', 'eduardo.martins@ghflusao.edu.br', 'PROF0022', 'Doutor', '40H'),
    (23, 'Patricia Gomes', '223.333.333-24', 'Rua Psi, 2303', DATE '1983-01-23', '(11) 90000-0023', 'patricia.gomes@ghflusao.edu.br', 'PROF0023', 'Mestre', '20H'),
    (24, 'Fabio Duarte', '224.444.444-25', 'Rua Omega, 2404', DATE '1981-02-24', '(11) 90000-0024', 'fabio.duarte@ghflusao.edu.br', 'PROF0024', 'Especialista', '40H'),
    (25, 'Aline Rocha', '225.555.555-26', 'Rua Orion, 2505', DATE '1975-03-25', '(11) 90000-0025', 'aline.rocha@ghflusao.edu.br', 'PROF0025', 'Doutor', '40H'),
    (26, 'Sergio Nascimento', '226.666.666-27', 'Rua Vega, 2606', DATE '1988-04-26', '(11) 90000-0026', 'sergio.nascimento@ghflusao.edu.br', 'PROF0026', 'Mestre', '20H'),
    (27, 'Bianca Torres', '227.777.777-28', 'Rua Sirius, 2707', DATE '1980-05-27', '(11) 90000-0027', 'bianca.torres@ghflusao.edu.br', 'PROF0027', 'Doutor', '40H'),
    (28, 'Nelson Farias', '228.888.888-29', 'Rua Polaris, 2808', DATE '1982-06-28', '(11) 90000-0028', 'nelson.farias@ghflusao.edu.br', 'PROF0028', 'Mestre', '40H'),
    (29, 'Carolina Melo', '229.999.999-30', 'Rua Altair, 2909', DATE '1986-07-29', '(11) 90000-0029', 'carolina.melo@ghflusao.edu.br', 'PROF0029', 'Especialista', '20H'),
    (30, 'Roberto Vieira', '230.101.101-30', 'Rua Deneb, 3001', DATE '1979-08-30', '(11) 90000-0030', 'roberto.vieira@ghflusao.edu.br', 'PROF0030', 'Doutor', '40H')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cursos (id, nome, ch_total, prev_termino_anos, limite_conclusao, coordenador_id)
VALUES
    (11, 'Arquitetura de Software', 3200, 4, 7, 11),
    (12, 'Computacao em Nuvem', 3000, 4, 6, 12),
    (13, 'Ciencia de Dados', 3400, 4, 7, 13),
    (14, 'Sistemas Embarcados', 3200, 4, 7, 14),
    (15, 'DevOps e Plataformas', 2800, 3, 5, 15),
    (16, 'Engenharia de Dados', 3200, 4, 7, 16),
    (17, 'UX e Produtos Digitais', 2400, 3, 5, 17),
    (18, 'Ciberseguranca Aplicada', 3000, 4, 6, 18),
    (19, 'Automacao Inteligente', 2800, 3, 5, 19),
    (20, 'Tecnologia para Negocios', 2200, 3, 5, 20),
    (21, 'Analise de Sistemas Corporativos', 3000, 4, 6, 21),
    (22, 'Infraestrutura de TI', 2600, 3, 5, 22),
    (23, 'Aplicacoes Mobile', 2600, 3, 5, 23),
    (24, 'Qualidade de Software', 2400, 3, 5, 24),
    (25, 'Gestao de Dados', 2800, 3, 5, 25),
    (26, 'Inteligencia de Mercado', 2400, 3, 5, 26),
    (27, 'Robotica Educacional', 2600, 3, 5, 27),
    (28, 'Computacao Grafica', 2800, 3, 5, 28),
    (29, 'Sistemas para Saude', 3000, 4, 6, 29),
    (30, 'Tecnologias Educacionais', 2400, 3, 5, 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO disciplinas (id, codigo, nome, creditos, ch, ementa, modalidade, curso_id, ativo, pre_requisito_id)
VALUES
    (11, 'ARQ201', 'Arquitetura Hexagonal', 4, 80, 'Portas, adaptadores e limites de dominio.', 'HIBRIDA', 11, 1, 2),
    (12, 'NUV201', 'Servicos em Nuvem', 4, 60, 'Provisionamento, redes e observabilidade.', 'EAD', 12, 1, 5),
    (13, 'DS201', 'Analise Exploratoria', 4, 80, 'Preparacao, visualizacao e metricas.', 'PRESENCIAL', 13, 1, 9),
    (14, 'EMB201', 'Microcontroladores', 4, 80, 'Sensores, atuadores e comunicacao serial.', 'PRESENCIAL', 14, 1, 3),
    (15, 'DOP201', 'Pipelines CI CD', 3, 60, 'Automacao de build, testes e entrega.', 'HIBRIDA', 15, 1, 2),
    (16, 'ED201', 'Processamento Distribuido', 4, 80, 'Jobs, particionamento e consistencia.', 'PRESENCIAL', 16, 1, 6),
    (17, 'UX201', 'Pesquisa com Usuarios', 3, 60, 'Descoberta, entrevistas e sintese.', 'EAD', 17, 1, NULL),
    (18, 'CIB201', 'Resposta a Incidentes', 4, 60, 'Triagem, contencao e recuperacao.', 'HIBRIDA', 18, 1, 8),
    (19, 'AUT201', 'RPA e Orquestracao', 3, 60, 'Fluxos automatizados e integracoes.', 'PRESENCIAL', 19, 1, 7),
    (20, 'NEG201', 'Indicadores Digitais', 3, 60, 'KPIs, funis e analise executiva.', 'EAD', 20, 1, NULL),
    (21, 'ASC201', 'Integracao de Sistemas', 4, 80, 'Mensageria, APIs e contratos.', 'HIBRIDA', 21, 1, 11),
    (22, 'INF201', 'Administracao Linux', 4, 60, 'Servicos, processos e automacao.', 'PRESENCIAL', 22, 1, 5),
    (23, 'MOB201', 'Desenvolvimento Mobile', 4, 80, 'Aplicativos nativos e multiplataforma.', 'PRESENCIAL', 23, 1, 4),
    (24, 'QAS201', 'Testes Automatizados', 4, 60, 'Testes unitarios, integracao e contrato.', 'HIBRIDA', 24, 1, 15),
    (25, 'GDD201', 'Data Governance', 3, 60, 'Qualidade, catalogo e linhagem de dados.', 'EAD', 25, 1, 16),
    (26, 'MER201', 'Analise de Mercado', 3, 60, 'Segmentacao e indicadores competitivos.', 'EAD', 26, 1, 20),
    (27, 'ROB201', 'Controle e Movimento', 4, 80, 'Cinematica, sensores e controle.', 'PRESENCIAL', 27, 1, 14),
    (28, 'CG201', 'Renderizacao 3D', 4, 80, 'Cena, camera, luz e materiais.', 'PRESENCIAL', 28, 1, 10),
    (29, 'SAU201', 'Sistemas Clinicos', 4, 60, 'Prontuario, interoperabilidade e privacidade.', 'HIBRIDA', 29, 1, 18),
    (30, 'TED201', 'Ambientes Virtuais', 3, 60, 'Plataformas, trilhas e acompanhamento.', 'EAD', 30, 1, 17)
ON CONFLICT (id) DO NOTHING;

INSERT INTO alunos (id, nome, cpf, endereco, dt_nascimento, telefone, email, matricula_id, turno, nec_especial, curso_id)
VALUES
    (11, 'Gabriel Martins', '123.456.789-11', 'Avenida Central, 21', DATE '2002-11-11', '(21) 91000-0011', 'gabriel.martins@aluno.ghflusao.edu.br', 100011, 'NOITE', NULL, 11),
    (12, 'Sofia Cardoso', '123.456.789-12', 'Avenida Central, 22', DATE '2001-12-12', '(21) 91000-0012', 'sofia.cardoso@aluno.ghflusao.edu.br', 100012, 'MANHA', NULL, 12),
    (13, 'Henrique Lopes', '123.456.789-13', 'Avenida Central, 23', DATE '2003-01-13', '(21) 91000-0013', 'henrique.lopes@aluno.ghflusao.edu.br', 100013, 'TARDE', NULL, 13),
    (14, 'Leticia Barbosa', '123.456.789-14', 'Avenida Central, 24', DATE '2000-02-14', '(21) 91000-0014', 'leticia.barbosa@aluno.ghflusao.edu.br', 100014, 'NOITE', NULL, 14),
    (15, 'Matheus Cunha', '123.456.789-15', 'Avenida Central, 25', DATE '2002-03-15', '(21) 91000-0015', 'matheus.cunha@aluno.ghflusao.edu.br', 100015, 'MANHA', NULL, 15),
    (16, 'Yasmin Correia', '123.456.789-16', 'Avenida Central, 26', DATE '2001-04-16', '(21) 91000-0016', 'yasmin.correia@aluno.ghflusao.edu.br', 100016, 'TARDE', NULL, 16),
    (17, 'Felipe Duarte', '123.456.789-17', 'Avenida Central, 27', DATE '2003-05-17', '(21) 91000-0017', 'felipe.duarte@aluno.ghflusao.edu.br', 100017, 'NOITE', NULL, 17),
    (18, 'Clara Vieira', '123.456.789-18', 'Avenida Central, 28', DATE '2000-06-18', '(21) 91000-0018', 'clara.vieira@aluno.ghflusao.edu.br', 100018, 'MANHA', NULL, 18),
    (19, 'Joao Batista', '123.456.789-19', 'Avenida Central, 29', DATE '2002-07-19', '(21) 91000-0019', 'joao.batista@aluno.ghflusao.edu.br', 100019, 'TARDE', NULL, 19),
    (20, 'Vitoria Sales', '123.456.789-20', 'Avenida Central, 30', DATE '2001-08-20', '(21) 91000-0020', 'vitoria.sales@aluno.ghflusao.edu.br', 100020, 'NOITE', NULL, 20),
    (21, 'Davi Monteiro', '123.456.789-21', 'Avenida Central, 31', DATE '2002-09-21', '(21) 91000-0021', 'davi.monteiro@aluno.ghflusao.edu.br', 100021, 'MANHA', NULL, 21),
    (22, 'Helena Moraes', '123.456.789-22', 'Avenida Central, 32', DATE '2001-10-22', '(21) 91000-0022', 'helena.moraes@aluno.ghflusao.edu.br', 100022, 'TARDE', NULL, 22),
    (23, 'Arthur Pacheco', '123.456.789-23', 'Avenida Central, 33', DATE '2003-11-23', '(21) 91000-0023', 'arthur.pacheco@aluno.ghflusao.edu.br', 100023, 'NOITE', NULL, 23),
    (24, 'Livia Figueiredo', '123.456.789-24', 'Avenida Central, 34', DATE '2000-12-24', '(21) 91000-0024', 'livia.figueiredo@aluno.ghflusao.edu.br', 100024, 'MANHA', NULL, 24),
    (25, 'Caio Fernandes', '123.456.789-25', 'Avenida Central, 35', DATE '2002-01-25', '(21) 91000-0025', 'caio.fernandes@aluno.ghflusao.edu.br', 100025, 'TARDE', NULL, 25),
    (26, 'Manuela Costa', '123.456.789-26', 'Avenida Central, 36', DATE '2001-02-26', '(21) 91000-0026', 'manuela.costa@aluno.ghflusao.edu.br', 100026, 'NOITE', NULL, 26),
    (27, 'Miguel Nogueira', '123.456.789-27', 'Avenida Central, 37', DATE '2003-03-27', '(21) 91000-0027', 'miguel.nogueira@aluno.ghflusao.edu.br', 100027, 'MANHA', NULL, 27),
    (28, 'Ester Azevedo', '123.456.789-28', 'Avenida Central, 38', DATE '2000-04-28', '(21) 91000-0028', 'ester.azevedo@aluno.ghflusao.edu.br', 100028, 'TARDE', NULL, 28),
    (29, 'Ruan Campos', '123.456.789-29', 'Avenida Central, 39', DATE '2002-05-29', '(21) 91000-0029', 'ruan.campos@aluno.ghflusao.edu.br', 100029, 'NOITE', NULL, 29),
    (30, 'Alice Neves', '123.456.789-30', 'Avenida Central, 40', DATE '2001-06-30', '(21) 91000-0030', 'alice.neves@aluno.ghflusao.edu.br', 100030, 'MANHA', NULL, 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO turmas (id, codigo, horario, vagas, carga_horaria, semestre, ano, turno, sala, status, ativo, professor_id, disciplina_id)
VALUES
    (11, 'ARQ201-2026-1A', 'Seg 21:00', 36, 80, '2026.1', 2026, 'NOITE', 'B301', 'IN_PROGRESS', 1, 11, 11),
    (12, 'NUV201-2026-1A', 'Ter 08:00', 40, 60, '2026.1', 2026, 'MANHA', 'LAB6', 'OPEN', 1, 12, 12),
    (13, 'DS201-2026-1A', 'Qua 14:00', 32, 80, '2026.1', 2026, 'TARDE', 'LAB7', 'IN_PROGRESS', 1, 13, 13),
    (14, 'EMB201-2026-1A', 'Qui 19:00', 28, 80, '2026.1', 2026, 'NOITE', 'LAB8', 'OPEN', 1, 14, 14),
    (15, 'DOP201-2026-1A', 'Sex 08:00', 35, 60, '2026.1', 2026, 'MANHA', 'B302', 'CLOSED', 1, 15, 15),
    (16, 'ED201-2026-1A', 'Seg 14:00', 30, 80, '2026.1', 2026, 'TARDE', 'LAB9', 'IN_PROGRESS', 1, 16, 16),
    (17, 'UX201-2026-1A', 'Ter 21:00', 45, 60, '2026.1', 2026, 'NOITE', 'EAD', 'OPEN', 1, 17, 17),
    (18, 'CIB201-2026-1A', 'Qua 08:00', 25, 60, '2026.1', 2026, 'MANHA', 'LAB10', 'IN_PROGRESS', 1, 18, 18),
    (19, 'AUT201-2026-1A', 'Qui 14:00', 35, 60, '2026.1', 2026, 'TARDE', 'C401', 'CLOSED', 1, 19, 19),
    (20, 'NEG201-2026-1A', 'Sex 19:00', 50, 60, '2026.1', 2026, 'NOITE', 'EAD', 'OPEN', 1, 20, 20),
    (21, 'ASC201-2026-2A', 'Seg 08:00', 34, 80, '2026.2', 2026, 'MANHA', 'B401', 'OPEN', 1, 21, 21),
    (22, 'INF201-2026-2A', 'Ter 14:00', 30, 60, '2026.2', 2026, 'TARDE', 'LAB11', 'IN_PROGRESS', 1, 22, 22),
    (23, 'MOB201-2026-2A', 'Qua 21:00', 32, 80, '2026.2', 2026, 'NOITE', 'LAB12', 'OPEN', 1, 23, 23),
    (24, 'QAS201-2026-2A', 'Qui 08:00', 36, 60, '2026.2', 2026, 'MANHA', 'B402', 'IN_PROGRESS', 1, 24, 24),
    (25, 'GDD201-2026-2A', 'Sex 14:00', 40, 60, '2026.2', 2026, 'TARDE', 'EAD', 'CLOSED', 1, 25, 25),
    (26, 'MER201-2026-2A', 'Seg 19:00', 45, 60, '2026.2', 2026, 'NOITE', 'EAD', 'OPEN', 1, 26, 26),
    (27, 'ROB201-2026-2A', 'Ter 08:00', 26, 80, '2026.2', 2026, 'MANHA', 'LAB13', 'IN_PROGRESS', 1, 27, 27),
    (28, 'CG201-2026-2A', 'Qua 14:00', 28, 80, '2026.2', 2026, 'TARDE', 'LAB14', 'OPEN', 1, 28, 28),
    (29, 'SAU201-2026-2A', 'Qui 21:00', 35, 60, '2026.2', 2026, 'NOITE', 'B403', 'IN_PROGRESS', 1, 29, 29),
    (30, 'TED201-2026-2A', 'Sex 08:00', 48, 60, '2026.2', 2026, 'MANHA', 'EAD', 'OPEN', 1, 30, 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO matriculas_em_turma (id, aluno_id, turma_id, dt_inscricao, situacao, frequencia, media_final, observacao)
VALUES
    (11, 11, 11, DATE '2026-02-06', 'ATIVA', 91.00, 8.10, 'Acompanhamento regular'),
    (12, 12, 12, DATE '2026-02-06', 'ATIVA', 86.00, 7.40, 'Acompanhamento regular'),
    (13, 13, 13, DATE '2026-02-07', 'ATIVA', 63.00, 4.80, 'Aluno em risco por frequencia e nota'),
    (14, 14, 14, DATE '2026-02-07', 'CONCLUIDA', 94.00, 8.90, 'Concluida com bom desempenho'),
    (15, 15, 15, DATE '2026-02-08', 'REPROVADA', 58.00, 4.20, 'Reprovada por desempenho'),
    (16, 16, 16, DATE '2026-02-08', 'ATIVA', 89.00, 7.90, 'Acompanhamento regular'),
    (17, 17, 17, DATE '2026-02-09', 'TRANCADA', 41.00, NULL, 'Trancamento solicitado'),
    (18, 18, 18, DATE '2026-02-09', 'ATIVA', 72.00, 5.80, 'Precisa de recuperacao'),
    (19, 19, 19, DATE '2026-02-10', 'CONCLUIDA', 97.00, 9.30, 'Concluida com destaque'),
    (20, 20, 20, DATE '2026-02-10', 'ATIVA', 78.00, 6.20, 'Acompanhamento regular'),
    (21, 21, 21, DATE '2026-08-01', 'ATIVA', 83.00, 7.10, 'Acompanhamento regular'),
    (22, 22, 22, DATE '2026-08-01', 'ATIVA', 69.00, 5.30, 'Monitoria recomendada'),
    (23, 23, 23, DATE '2026-08-02', 'ATIVA', 88.00, 8.00, 'Acompanhamento regular'),
    (24, 24, 24, DATE '2026-08-02', 'CONCLUIDA', 92.00, 8.60, 'Concluida com bom desempenho'),
    (25, 25, 25, DATE '2026-08-03', 'REPROVADA', 55.00, 3.90, 'Reprovada por baixa media'),
    (26, 26, 26, DATE '2026-08-03', 'ATIVA', 81.00, 6.90, 'Acompanhamento regular'),
    (27, 27, 27, DATE '2026-08-04', 'ATIVA', 74.00, 6.00, 'Acompanhamento regular'),
    (28, 28, 28, DATE '2026-08-04', 'TRANCADA', 46.00, NULL, 'Trancamento administrativo'),
    (29, 29, 29, DATE '2026-08-05', 'ATIVA', 67.00, 5.10, 'Plano de apoio ativo'),
    (30, 30, 30, DATE '2026-08-05', 'CONCLUIDA', 96.00, 9.10, 'Concluida com destaque')
ON CONFLICT (id) DO NOTHING;

INSERT INTO provas (id, codigo, peso, conteudo, turma_id)
VALUES
    (11, '879011', 4.00, 'Componentes, dependencias e contratos.', 11),
    (12, '879012', 3.50, 'Redes, storage e escalabilidade.', 12),
    (13, '879013', 4.00, 'Limpeza, amostragem e visualizacao.', 13),
    (14, '879014', 4.50, 'GPIO, sensores e temporizadores.', 14),
    (15, '879015', 3.00, 'Build, deploy e rollback.', 15),
    (16, '879016', 4.00, 'Processamento em lote e streaming.', 16),
    (17, '879017', 3.50, 'Roteiros, entrevistas e matriz de achados.', 17),
    (18, '879018', 4.00, 'Contencao e evidencias de incidente.', 18),
    (19, '879019', 3.50, 'Automacao de processos repetitivos.', 19),
    (20, '879020', 3.00, 'Painel executivo e metricas de produto.', 20),
    (21, '879021', 4.00, 'Eventos, APIs e tolerancia a falhas.', 21),
    (22, '879022', 3.50, 'Processos, usuarios e permissoes.', 22),
    (23, '879023', 4.00, 'Navegacao, estado e persistencia local.', 23),
    (24, '879024', 4.00, 'Testes de servico e contratos.', 24),
    (25, '879025', 3.50, 'Catalogo, qualidade e privacidade.', 25),
    (26, '879026', 3.00, 'Segmentos, score e tendencias.', 26),
    (27, '879027', 4.50, 'Controle de motores e sensores.', 27),
    (28, '879028', 4.00, 'Materiais, luzes e camera.', 28),
    (29, '879029', 3.50, 'Fluxos clinicos e interoperabilidade.', 29),
    (30, '879030', 3.00, 'Trilhas, rubricas e acompanhamento.', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO resultados_prova (id, matricula_id, prova_id, nota, presente, data_realizacao, duracao_min)
VALUES
    (11, 11, 11, 8.10, 1, DATE '2026-03-30', 100),
    (12, 12, 12, 7.40, 1, DATE '2026-03-31', 90),
    (13, 13, 13, 4.80, 1, DATE '2026-04-01', 100),
    (14, 14, 14, 8.90, 1, DATE '2026-04-02', 110),
    (15, 15, 15, 4.20, 1, DATE '2026-04-03', 80),
    (16, 16, 16, 7.90, 1, DATE '2026-04-04', 100),
    (17, 17, 17, NULL, 0, DATE '2026-04-05', 0),
    (18, 18, 18, 5.80, 1, DATE '2026-04-06', 90),
    (19, 19, 19, 9.30, 1, DATE '2026-04-07', 80),
    (20, 20, 20, 6.20, 1, DATE '2026-04-08', 90),
    (21, 21, 21, 7.10, 1, DATE '2026-09-15', 100),
    (22, 22, 22, 5.30, 1, DATE '2026-09-16', 90),
    (23, 23, 23, 8.00, 1, DATE '2026-09-17', 100),
    (24, 24, 24, 8.60, 1, DATE '2026-09-18', 90),
    (25, 25, 25, 3.90, 1, DATE '2026-09-19', 80),
    (26, 26, 26, 6.90, 1, DATE '2026-09-20', 90),
    (27, 27, 27, 6.00, 1, DATE '2026-09-21', 100),
    (28, 28, 28, NULL, 0, DATE '2026-09-22', 0),
    (29, 29, 29, 5.10, 1, DATE '2026-09-23', 90),
    (30, 30, 30, 9.10, 1, DATE '2026-09-24', 90)
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuarios_sistema (id, login, senha_hash, perfil, pessoa_id, ativo)
VALUES
    (11, '100011', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 11, true),
    (12, '100012', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 12, true),
    (13, '100013', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 13, true),
    (14, '100014', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 14, true),
    (15, '100015', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 15, true),
    (16, '100016', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 16, true),
    (17, '100017', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 17, true),
    (18, '100018', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 18, true),
    (19, '100019', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 19, true),
    (20, '100020', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 20, true),
    (21, '100021', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 21, true),
    (22, '100022', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 22, true),
    (23, '100023', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 23, true),
    (24, '100024', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 24, true),
    (25, '100025', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 25, true),
    (26, '100026', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 26, true),
    (27, '100027', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 27, true),
    (28, '100028', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 28, true),
    (29, '100029', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 29, true),
    (30, '100030', '$2a$10$4iE3E6j8iU/yIk1VaJBvFeaAhfmXoKBQKHdOubX0SnlZyLn3HAEcq', 'ALUNO', 30, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('professores', 'id'), (SELECT max(id) FROM professores));
SELECT setval(pg_get_serial_sequence('cursos', 'id'), (SELECT max(id) FROM cursos));
SELECT setval(pg_get_serial_sequence('disciplinas', 'id'), (SELECT max(id) FROM disciplinas));
SELECT setval(pg_get_serial_sequence('alunos', 'id'), (SELECT max(id) FROM alunos));
SELECT setval(pg_get_serial_sequence('turmas', 'id'), (SELECT max(id) FROM turmas));
SELECT setval(pg_get_serial_sequence('matriculas_em_turma', 'id'), (SELECT max(id) FROM matriculas_em_turma));
SELECT setval(pg_get_serial_sequence('provas', 'id'), (SELECT max(id) FROM provas));
SELECT setval(pg_get_serial_sequence('resultados_prova', 'id'), (SELECT max(id) FROM resultados_prova));
SELECT setval(pg_get_serial_sequence('usuarios_sistema', 'id'), (SELECT max(id) FROM usuarios_sistema));
SELECT setval('seq_aluno_matricula', (SELECT max(matricula_id) FROM alunos), true);

SELECT refresh_dashboard_metricas_cache();
SELECT refresh_relatorio_academico_cache();
