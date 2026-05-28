CREATE TABLE dashboard_metricas (
    id                  integer PRIMARY KEY CHECK (id = 1),
    total_cursos        bigint NOT NULL DEFAULT 0,
    total_disciplinas   bigint NOT NULL DEFAULT 0,
    total_professores   bigint NOT NULL DEFAULT 0,
    total_alunos        bigint NOT NULL DEFAULT 0,
    total_turmas        bigint NOT NULL DEFAULT 0,
    total_matriculas    bigint NOT NULL DEFAULT 0,
    total_provas        bigint NOT NULL DEFAULT 0,
    total_resultados    bigint NOT NULL DEFAULT 0,
    atualizado_em       timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION refresh_dashboard_metricas_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO dashboard_metricas (
        id,
        total_cursos,
        total_disciplinas,
        total_professores,
        total_alunos,
        total_turmas,
        total_matriculas,
        total_provas,
        total_resultados,
        atualizado_em
    )
    SELECT
        1,
        (SELECT count(*) FROM cursos),
        (SELECT count(*) FROM disciplinas WHERE COALESCE(ativo, 1) = 1),
        (SELECT count(*) FROM professores),
        (SELECT count(*) FROM alunos),
        (SELECT count(*) FROM turmas WHERE COALESCE(ativo, 1) = 1),
        (SELECT count(*) FROM matriculas_em_turma),
        (SELECT count(*) FROM provas),
        (SELECT count(*) FROM resultados_prova),
        CURRENT_TIMESTAMP
    ON CONFLICT (id) DO UPDATE SET
        total_cursos = EXCLUDED.total_cursos,
        total_disciplinas = EXCLUDED.total_disciplinas,
        total_professores = EXCLUDED.total_professores,
        total_alunos = EXCLUDED.total_alunos,
        total_turmas = EXCLUDED.total_turmas,
        total_matriculas = EXCLUDED.total_matriculas,
        total_provas = EXCLUDED.total_provas,
        total_resultados = EXCLUDED.total_resultados,
        atualizado_em = EXCLUDED.atualizado_em;
END;
$$;

CREATE OR REPLACE FUNCTION trg_refresh_dashboard_metricas()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM refresh_dashboard_metricas_cache();
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_dash_cursos ON cursos;
CREATE TRIGGER trg_dash_cursos
AFTER INSERT OR UPDATE OR DELETE ON cursos
FOR EACH STATEMENT EXECUTE FUNCTION trg_refresh_dashboard_metricas();

DROP TRIGGER IF EXISTS trg_dash_disciplinas ON disciplinas;
CREATE TRIGGER trg_dash_disciplinas
AFTER INSERT OR UPDATE OR DELETE ON disciplinas
FOR EACH STATEMENT EXECUTE FUNCTION trg_refresh_dashboard_metricas();

DROP TRIGGER IF EXISTS trg_dash_professores ON professores;
CREATE TRIGGER trg_dash_professores
AFTER INSERT OR UPDATE OR DELETE ON professores
FOR EACH STATEMENT EXECUTE FUNCTION trg_refresh_dashboard_metricas();

DROP TRIGGER IF EXISTS trg_dash_alunos ON alunos;
CREATE TRIGGER trg_dash_alunos
AFTER INSERT OR UPDATE OR DELETE ON alunos
FOR EACH STATEMENT EXECUTE FUNCTION trg_refresh_dashboard_metricas();

DROP TRIGGER IF EXISTS trg_dash_turmas ON turmas;
CREATE TRIGGER trg_dash_turmas
AFTER INSERT OR UPDATE OR DELETE ON turmas
FOR EACH STATEMENT EXECUTE FUNCTION trg_refresh_dashboard_metricas();

DROP TRIGGER IF EXISTS trg_dash_matriculas ON matriculas_em_turma;
CREATE TRIGGER trg_dash_matriculas
AFTER INSERT OR UPDATE OR DELETE ON matriculas_em_turma
FOR EACH STATEMENT EXECUTE FUNCTION trg_refresh_dashboard_metricas();

DROP TRIGGER IF EXISTS trg_dash_provas ON provas;
CREATE TRIGGER trg_dash_provas
AFTER INSERT OR UPDATE OR DELETE ON provas
FOR EACH STATEMENT EXECUTE FUNCTION trg_refresh_dashboard_metricas();

DROP TRIGGER IF EXISTS trg_dash_resultados ON resultados_prova;
CREATE TRIGGER trg_dash_resultados
AFTER INSERT OR UPDATE OR DELETE ON resultados_prova
FOR EACH STATEMENT EXECUTE FUNCTION trg_refresh_dashboard_metricas();

SELECT refresh_dashboard_metricas_cache();
