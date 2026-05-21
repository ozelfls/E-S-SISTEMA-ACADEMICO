CREATE TABLE auditoria_resultados (
    id                NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resultado_id      NUMBER NOT NULL REFERENCES resultados_prova (id),
    prova_id          NUMBER NOT NULL REFERENCES provas (id),
    turma_id          NUMBER NOT NULL REFERENCES turmas (id),
    matricula_id      NUMBER NOT NULL REFERENCES matriculas_em_turma (id),
    aluno_id          NUMBER NOT NULL REFERENCES alunos (id),
    nota_anterior     NUMBER(4, 2),
    nota_nova         NUMBER(4, 2),
    presente_anterior NUMBER(1),
    presente_novo     NUMBER(1),
    data_anterior     DATE,
    data_nova         DATE,
    duracao_anterior  NUMBER(4),
    duracao_nova      NUMBER(4),
    usuario_id        NUMBER REFERENCES usuarios_sistema (id),
    usuario_login     VARCHAR2(80),
    usuario_perfil    VARCHAR2(15),
    motivo            VARCHAR2(500),
    alterado_em       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_aud_res_resultado ON auditoria_resultados (resultado_id, alterado_em);
CREATE INDEX idx_aud_res_prova ON auditoria_resultados (prova_id, alterado_em);
CREATE INDEX idx_aud_res_matricula ON auditoria_resultados (matricula_id, alterado_em);
CREATE INDEX idx_aud_res_usuario ON auditoria_resultados (usuario_id, alterado_em);
