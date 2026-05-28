CREATE TABLE auditoria_resultados (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resultado_id        bigint NOT NULL REFERENCES resultados_prova (id),
    prova_id            bigint NOT NULL REFERENCES provas (id),
    turma_id            bigint NOT NULL REFERENCES turmas (id),
    matricula_id        bigint NOT NULL REFERENCES matriculas_em_turma (id),
    aluno_id            bigint NOT NULL REFERENCES alunos (id),
    nota_anterior       numeric(4, 2),
    nota_nova           numeric(4, 2),
    presente_anterior   smallint,
    presente_novo       smallint,
    data_anterior       date,
    data_nova           date,
    duracao_anterior    integer,
    duracao_nova        integer,
    usuario_id          bigint REFERENCES usuarios_sistema (id),
    usuario_login       varchar(80),
    usuario_perfil      varchar(15),
    motivo              varchar(500),
    alterado_em         timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_aud_res_presente_anterior CHECK (presente_anterior IS NULL OR presente_anterior IN (0, 1)),
    CONSTRAINT chk_aud_res_presente_novo CHECK (presente_novo IS NULL OR presente_novo IN (0, 1))
);

CREATE INDEX idx_aud_res_resultado ON auditoria_resultados (resultado_id, alterado_em);
CREATE INDEX idx_aud_res_prova ON auditoria_resultados (prova_id, alterado_em);
CREATE INDEX idx_aud_res_matricula ON auditoria_resultados (matricula_id, alterado_em);
CREATE INDEX idx_aud_res_usuario ON auditoria_resultados (usuario_id, alterado_em);
