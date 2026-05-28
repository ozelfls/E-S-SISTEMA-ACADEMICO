CREATE INDEX IF NOT EXISTS idx_alunos_curso_nome
    ON alunos (curso_id, nome);

CREATE INDEX IF NOT EXISTS idx_alunos_email_null
    ON alunos (id)
    WHERE email IS NULL;

CREATE INDEX IF NOT EXISTS idx_professores_nome
    ON professores (nome);

CREATE INDEX IF NOT EXISTS idx_cursos_nome
    ON cursos (nome);

CREATE INDEX IF NOT EXISTS idx_disciplinas_ativo_curso
    ON disciplinas (curso_id)
    WHERE ativo = 1;

CREATE INDEX IF NOT EXISTS idx_disciplinas_ativo_nome
    ON disciplinas (nome)
    WHERE ativo = 1;

CREATE INDEX IF NOT EXISTS idx_turmas_ativo_turno
    ON turmas (turno)
    WHERE ativo = 1;

CREATE INDEX IF NOT EXISTS idx_turmas_ativo_status
    ON turmas (status)
    WHERE ativo = 1;

CREATE INDEX IF NOT EXISTS idx_turmas_ativo_semestre_ano
    ON turmas (semestre, ano)
    WHERE ativo = 1;

CREATE INDEX IF NOT EXISTS idx_turmas_ativo_professor
    ON turmas (professor_id)
    WHERE ativo = 1;

CREATE INDEX IF NOT EXISTS idx_turmas_ativo_disciplina
    ON turmas (disciplina_id)
    WHERE ativo = 1;

CREATE INDEX IF NOT EXISTS idx_matriculas_turma_situacao
    ON matriculas_em_turma (turma_id, situacao);

CREATE INDEX IF NOT EXISTS idx_matriculas_aluno_situacao
    ON matriculas_em_turma (aluno_id, situacao);

CREATE INDEX IF NOT EXISTS idx_matriculas_situacao_frequencia_media
    ON matriculas_em_turma (situacao, frequencia, media_final);

CREATE INDEX IF NOT EXISTS idx_provas_turma_codigo
    ON provas (turma_id, codigo);

CREATE INDEX IF NOT EXISTS idx_resultados_prova_nota_null
    ON resultados_prova (prova_id, matricula_id)
    WHERE nota IS NULL;

CREATE INDEX IF NOT EXISTS idx_resultados_matricula_nota
    ON resultados_prova (matricula_id, nota);

CREATE INDEX IF NOT EXISTS idx_rel_acad_situacao_risco
    ON relatorio_academico_cache (matricula_situacao, matricula_media_final, matricula_frequencia);

CREATE INDEX IF NOT EXISTS idx_rel_acad_order
    ON relatorio_academico_cache (matricula_id DESC, prova_id);

CREATE INDEX IF NOT EXISTS idx_rel_acad_curso
    ON relatorio_academico_cache (curso_id, curso_nome);

CREATE INDEX IF NOT EXISTS idx_rel_acad_disciplina
    ON relatorio_academico_cache (disciplina_id, disciplina_nome);

CREATE INDEX IF NOT EXISTS idx_rel_acad_professor
    ON relatorio_academico_cache (professor_id, professor_nome);

CREATE INDEX IF NOT EXISTS idx_aud_res_alterado
    ON auditoria_resultados (alterado_em DESC);
