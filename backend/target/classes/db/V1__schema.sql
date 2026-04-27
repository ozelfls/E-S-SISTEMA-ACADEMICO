CREATE TABLE cursos (
    id                NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome              VARCHAR2(120) NOT NULL,
    ch_total          NUMBER(5)     NOT NULL,
    prev_termino_anos NUMBER(2)     NOT NULL,
    limite_conclusao  NUMBER(2)     NOT NULL,
    coordenador_id    NUMBER
);

CREATE TABLE professores (
    id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome            VARCHAR2(120) NOT NULL,
    cpf             VARCHAR2(14)  NOT NULL UNIQUE,
    endereco        VARCHAR2(255),
    dt_nascimento   DATE,
    telefone        VARCHAR2(20),
    email           VARCHAR2(120),
    registro        VARCHAR2(20) UNIQUE,
    titulacao       VARCHAR2(60),
    regime_trabalho VARCHAR2(10)
);

ALTER TABLE cursos
    ADD CONSTRAINT fk_curso_coord FOREIGN KEY (coordenador_id) REFERENCES professores (id);

CREATE TABLE alunos (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome          VARCHAR2(120) NOT NULL,
    cpf           VARCHAR2(14)  NOT NULL UNIQUE,
    endereco      VARCHAR2(255),
    dt_nascimento DATE,
    telefone      VARCHAR2(20),
    email         VARCHAR2(120),
    matricula_id  NUMBER(10)    NOT NULL UNIQUE,
    turno         VARCHAR2(10) CHECK (turno IN ('MANHA', 'TARDE', 'NOITE', 'INTEGRAL')),
    nec_especial  VARCHAR2(255),
    curso_id      NUMBER REFERENCES cursos (id)
);

CREATE TABLE disciplinas (
    id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo          VARCHAR2(10)  NOT NULL UNIQUE,
    nome            VARCHAR2(120) NOT NULL,
    creditos        NUMBER(2)     NOT NULL,
    ch              NUMBER(4)     NOT NULL,
    ementa          CLOB,
    modalidade      VARCHAR2(10) CHECK (modalidade IN ('PRESENCIAL', 'EAD', 'HIBRIDA')),
    curso_id        NUMBER REFERENCES cursos (id),
    pre_requisito_id NUMBER REFERENCES disciplinas (id)
);

CREATE TABLE turmas (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo        VARCHAR2(30) NOT NULL UNIQUE,
    horario       VARCHAR2(30),
    vagas         NUMBER(3)    NOT NULL CHECK (vagas >= 0),
    semestre      VARCHAR2(10) NOT NULL,
    ano           NUMBER(4)    NOT NULL,
    turno         VARCHAR2(10) CHECK (turno IN ('MANHA', 'TARDE', 'NOITE')),
    sala          VARCHAR2(20),
    professor_id  NUMBER REFERENCES professores (id),
    disciplina_id NUMBER REFERENCES disciplinas (id)
);

CREATE TABLE matriculas_em_turma (
    id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    aluno_id     NUMBER      NOT NULL REFERENCES alunos (id),
    turma_id     NUMBER      NOT NULL REFERENCES turmas (id),
    dt_inscricao DATE DEFAULT SYSDATE NOT NULL,
    situacao     VARCHAR2(12) DEFAULT 'ATIVA' CHECK (situacao IN ('ATIVA', 'TRANCADA', 'CONCLUIDA', 'REPROVADA')),
    frequencia   NUMBER(5, 2) DEFAULT 0 CHECK (frequencia BETWEEN 0 AND 100),
    observacao   VARCHAR2(500),
    CONSTRAINT uq_aluno_turma UNIQUE (aluno_id, turma_id)
);

CREATE TABLE provas (
    id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo   VARCHAR2(40) NOT NULL UNIQUE,
    peso     NUMBER(4, 2) NOT NULL CHECK (peso > 0),
    conteudo VARCHAR2(500),
    turma_id NUMBER       NOT NULL REFERENCES turmas (id)
);

CREATE TABLE resultados_prova (
    id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    matricula_id   NUMBER NOT NULL REFERENCES matriculas_em_turma (id),
    prova_id       NUMBER NOT NULL REFERENCES provas (id),
    nota           NUMBER(4, 2) CHECK (nota BETWEEN 0 AND 10),
    presente       NUMBER(1) DEFAULT 0 CHECK (presente IN (0, 1)),
    data_realizacao DATE,
    duracao_min    NUMBER(4),
    CONSTRAINT uq_matricula_prova UNIQUE (matricula_id, prova_id)
);

CREATE TABLE usuarios_sistema (
    id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login      VARCHAR2(50) NOT NULL UNIQUE,
    senha_hash VARCHAR2(60) NOT NULL,
    perfil     VARCHAR2(12) NOT NULL CHECK (perfil IN ('SECRETARIA', 'DIRETOR', 'COORDENADOR', 'PROFESSOR', 'ALUNO')),
    pessoa_id  NUMBER,
    ativo      NUMBER(1) DEFAULT 1 CHECK (ativo IN (0, 1))
);

CREATE INDEX idx_mat_aluno ON matriculas_em_turma (aluno_id);
CREATE INDEX idx_mat_turma ON matriculas_em_turma (turma_id);
CREATE INDEX idx_res_matricula ON resultados_prova (matricula_id);
CREATE INDEX idx_res_prova ON resultados_prova (prova_id);
CREATE INDEX idx_turma_disc ON turmas (disciplina_id);
CREATE INDEX idx_disc_curso ON disciplinas (curso_id);
