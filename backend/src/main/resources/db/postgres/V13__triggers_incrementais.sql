CREATE OR REPLACE FUNCTION rel_acad_insert_rows_for_matriculas(p_matricula_ids bigint[])
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_matricula_ids IS NULL OR cardinality(p_matricula_ids) = 0 THEN
        RETURN;
    END IF;

    INSERT INTO relatorio_academico_cache (
        aluno_id,
        aluno_nome,
        aluno_matricula,
        aluno_email,
        aluno_turno,
        curso_id,
        curso_nome,
        curso_ch_total,
        disciplina_id,
        disciplina_codigo,
        disciplina_nome,
        disciplina_ch,
        disciplina_modalidade,
        turma_id,
        turma_codigo,
        turma_turno,
        turma_semestre,
        turma_ano,
        turma_sala,
        turma_horario,
        turma_vagas,
        professor_id,
        professor_nome,
        professor_email,
        professor_titulacao,
        matricula_id,
        matricula_data,
        matricula_situacao,
        matricula_frequencia,
        matricula_media_final,
        prova_id,
        prova_codigo,
        prova_peso,
        prova_conteudo,
        resultado_id,
        resultado_nota,
        resultado_presente,
        resultado_data_realizacao,
        resultado_duracao_min
    )
    SELECT
        a.id,
        a.nome,
        a.matricula_id,
        a.email,
        a.turno,
        c.id,
        c.nome,
        c.ch_total,
        d.id,
        d.codigo,
        d.nome,
        d.ch,
        d.modalidade,
        t.id,
        t.codigo,
        t.turno,
        t.semestre,
        t.ano,
        t.sala,
        t.horario,
        t.vagas,
        p.id,
        p.nome,
        p.email,
        p.titulacao,
        m.id,
        m.dt_inscricao,
        m.situacao,
        m.frequencia,
        m.media_final,
        pr.id,
        pr.codigo,
        pr.peso,
        substring(pr.conteudo from 1 for 500),
        r.id,
        r.nota,
        r.presente,
        r.data_realizacao,
        r.duracao_min
    FROM matriculas_em_turma m
    LEFT JOIN alunos a ON a.id = m.aluno_id
    LEFT JOIN turmas t ON t.id = m.turma_id
    LEFT JOIN disciplinas d ON d.id = t.disciplina_id
    LEFT JOIN cursos c ON c.id = COALESCE(d.curso_id, a.curso_id)
    LEFT JOIN professores p ON p.id = t.professor_id
    LEFT JOIN provas pr ON pr.turma_id = t.id
    LEFT JOIN resultados_prova r ON r.matricula_id = m.id AND r.prova_id = pr.id
    WHERE m.id = ANY (p_matricula_ids);
END;
$$;

CREATE OR REPLACE FUNCTION rel_acad_refresh_matriculas(p_matricula_ids bigint[])
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_matricula_ids IS NULL OR cardinality(p_matricula_ids) = 0 THEN
        RETURN;
    END IF;

    DELETE FROM relatorio_academico_cache
    WHERE matricula_id = ANY (p_matricula_ids);

    PERFORM rel_acad_insert_rows_for_matriculas(p_matricula_ids);
END;
$$;

CREATE OR REPLACE FUNCTION rel_acad_refresh_aluno(p_aluno_id bigint)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_matriculas bigint[];
BEGIN
    SELECT array_agg(id)
    INTO v_matriculas
    FROM matriculas_em_turma
    WHERE aluno_id = p_aluno_id;

    PERFORM rel_acad_refresh_matriculas(v_matriculas);
END;
$$;

CREATE OR REPLACE FUNCTION rel_acad_refresh_turma(p_turma_id bigint)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_matriculas bigint[];
BEGIN
    SELECT array_agg(id)
    INTO v_matriculas
    FROM matriculas_em_turma
    WHERE turma_id = p_turma_id;

    DELETE FROM relatorio_academico_cache
    WHERE turma_id = p_turma_id;

    PERFORM rel_acad_insert_rows_for_matriculas(v_matriculas);
END;
$$;

CREATE OR REPLACE FUNCTION rel_acad_refresh_disciplina(p_disciplina_id bigint)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_turma_id bigint;
BEGIN
    FOR v_turma_id IN
        SELECT id FROM turmas WHERE disciplina_id = p_disciplina_id
    LOOP
        PERFORM rel_acad_refresh_turma(v_turma_id);
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION rel_acad_refresh_professor(p_professor_id bigint)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_turma_id bigint;
BEGIN
    FOR v_turma_id IN
        SELECT id FROM turmas WHERE professor_id = p_professor_id
    LOOP
        PERFORM rel_acad_refresh_turma(v_turma_id);
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION trg_rel_acad_alunos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM relatorio_academico_cache WHERE aluno_id = OLD.id;
        RETURN OLD;
    END IF;

    PERFORM rel_acad_refresh_aluno(NEW.id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_rel_acad_cursos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM relatorio_academico_cache WHERE curso_id = OLD.id;
        RETURN OLD;
    END IF;

    UPDATE relatorio_academico_cache
    SET curso_nome = NEW.nome,
        curso_ch_total = NEW.ch_total
    WHERE curso_id = NEW.id;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_rel_acad_disciplinas()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM relatorio_academico_cache WHERE disciplina_id = OLD.id;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.id IS DISTINCT FROM NEW.id THEN
        PERFORM rel_acad_refresh_disciplina(OLD.id);
    END IF;

    PERFORM rel_acad_refresh_disciplina(NEW.id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_rel_acad_turmas()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM relatorio_academico_cache WHERE turma_id = OLD.id;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.id IS DISTINCT FROM NEW.id THEN
        PERFORM rel_acad_refresh_turma(OLD.id);
    END IF;

    PERFORM rel_acad_refresh_turma(NEW.id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_rel_acad_professores()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE relatorio_academico_cache
        SET professor_id = NULL,
            professor_nome = NULL,
            professor_email = NULL,
            professor_titulacao = NULL
        WHERE professor_id = OLD.id;
        RETURN OLD;
    END IF;

    PERFORM rel_acad_refresh_professor(NEW.id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_rel_acad_matriculas()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM relatorio_academico_cache WHERE matricula_id = OLD.id;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.id IS DISTINCT FROM NEW.id THEN
        DELETE FROM relatorio_academico_cache WHERE matricula_id = OLD.id;
    END IF;

    PERFORM rel_acad_refresh_matriculas(ARRAY[NEW.id]::bigint[]);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_rel_acad_provas()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM relatorio_academico_cache WHERE prova_id = OLD.id;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.turma_id IS DISTINCT FROM NEW.turma_id THEN
        PERFORM rel_acad_refresh_turma(OLD.turma_id);
    END IF;

    PERFORM rel_acad_refresh_turma(NEW.turma_id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_rel_acad_resultados()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM rel_acad_refresh_matriculas(ARRAY[OLD.matricula_id]::bigint[]);
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.matricula_id IS DISTINCT FROM NEW.matricula_id THEN
        PERFORM rel_acad_refresh_matriculas(ARRAY[OLD.matricula_id]::bigint[]);
    END IF;

    PERFORM rel_acad_refresh_matriculas(ARRAY[NEW.matricula_id]::bigint[]);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rel_acad_alunos ON alunos;
CREATE TRIGGER trg_rel_acad_alunos
AFTER INSERT OR UPDATE OR DELETE ON alunos
FOR EACH ROW EXECUTE FUNCTION trg_rel_acad_alunos();

DROP TRIGGER IF EXISTS trg_rel_acad_cursos ON cursos;
CREATE TRIGGER trg_rel_acad_cursos
AFTER INSERT OR UPDATE OR DELETE ON cursos
FOR EACH ROW EXECUTE FUNCTION trg_rel_acad_cursos();

DROP TRIGGER IF EXISTS trg_rel_acad_disciplinas ON disciplinas;
CREATE TRIGGER trg_rel_acad_disciplinas
AFTER INSERT OR UPDATE OR DELETE ON disciplinas
FOR EACH ROW EXECUTE FUNCTION trg_rel_acad_disciplinas();

DROP TRIGGER IF EXISTS trg_rel_acad_turmas ON turmas;
CREATE TRIGGER trg_rel_acad_turmas
AFTER INSERT OR UPDATE OR DELETE ON turmas
FOR EACH ROW EXECUTE FUNCTION trg_rel_acad_turmas();

DROP TRIGGER IF EXISTS trg_rel_acad_professores ON professores;
CREATE TRIGGER trg_rel_acad_professores
AFTER INSERT OR UPDATE OR DELETE ON professores
FOR EACH ROW EXECUTE FUNCTION trg_rel_acad_professores();

DROP TRIGGER IF EXISTS trg_rel_acad_matriculas ON matriculas_em_turma;
CREATE TRIGGER trg_rel_acad_matriculas
AFTER INSERT OR UPDATE OR DELETE ON matriculas_em_turma
FOR EACH ROW EXECUTE FUNCTION trg_rel_acad_matriculas();

DROP TRIGGER IF EXISTS trg_rel_acad_provas ON provas;
CREATE TRIGGER trg_rel_acad_provas
AFTER INSERT OR UPDATE OR DELETE ON provas
FOR EACH ROW EXECUTE FUNCTION trg_rel_acad_provas();

DROP TRIGGER IF EXISTS trg_rel_acad_resultados ON resultados_prova;
CREATE TRIGGER trg_rel_acad_resultados
AFTER INSERT OR UPDATE OR DELETE ON resultados_prova
FOR EACH ROW EXECUTE FUNCTION trg_rel_acad_resultados();

CREATE OR REPLACE FUNCTION dashboard_metricas_increment(p_column_name text, p_delta integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_delta = 0 THEN
        RETURN;
    END IF;

    INSERT INTO dashboard_metricas (id) VALUES (1)
    ON CONFLICT (id) DO NOTHING;

    EXECUTE format(
        'UPDATE dashboard_metricas SET %1$I = GREATEST(0, %1$I + $1), atualizado_em = CURRENT_TIMESTAMP WHERE id = 1',
        p_column_name
    )
    USING p_delta;
END;
$$;

CREATE OR REPLACE FUNCTION trg_dashboard_metricas_incremental()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_column text;
    v_delta integer := 0;
    v_old_active integer := 0;
    v_new_active integer := 0;
BEGIN
    IF TG_TABLE_NAME = 'cursos' THEN
        v_column := 'total_cursos';
    ELSIF TG_TABLE_NAME = 'professores' THEN
        v_column := 'total_professores';
    ELSIF TG_TABLE_NAME = 'alunos' THEN
        v_column := 'total_alunos';
    ELSIF TG_TABLE_NAME = 'matriculas_em_turma' THEN
        v_column := 'total_matriculas';
    ELSIF TG_TABLE_NAME = 'provas' THEN
        v_column := 'total_provas';
    ELSIF TG_TABLE_NAME = 'resultados_prova' THEN
        v_column := 'total_resultados';
    ELSIF TG_TABLE_NAME = 'disciplinas' THEN
        v_column := 'total_disciplinas';
        IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
            IF COALESCE(OLD.ativo, 1) = 1 THEN
                v_old_active := 1;
            END IF;
        END IF;
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
            IF COALESCE(NEW.ativo, 1) = 1 THEN
                v_new_active := 1;
            END IF;
        END IF;
        v_delta := v_new_active - v_old_active;
        PERFORM dashboard_metricas_increment(v_column, v_delta);
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    ELSIF TG_TABLE_NAME = 'turmas' THEN
        v_column := 'total_turmas';
        IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
            IF COALESCE(OLD.ativo, 1) = 1 THEN
                v_old_active := 1;
            END IF;
        END IF;
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
            IF COALESCE(NEW.ativo, 1) = 1 THEN
                v_new_active := 1;
            END IF;
        END IF;
        v_delta := v_new_active - v_old_active;
        PERFORM dashboard_metricas_increment(v_column, v_delta);
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    ELSE
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        v_delta := 1;
    ELSIF TG_OP = 'DELETE' THEN
        v_delta := -1;
    END IF;

    PERFORM dashboard_metricas_increment(v_column, v_delta);
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dash_cursos ON cursos;
CREATE TRIGGER trg_dash_cursos
AFTER INSERT OR UPDATE OR DELETE ON cursos
FOR EACH ROW EXECUTE FUNCTION trg_dashboard_metricas_incremental();

DROP TRIGGER IF EXISTS trg_dash_disciplinas ON disciplinas;
CREATE TRIGGER trg_dash_disciplinas
AFTER INSERT OR UPDATE OR DELETE ON disciplinas
FOR EACH ROW EXECUTE FUNCTION trg_dashboard_metricas_incremental();

DROP TRIGGER IF EXISTS trg_dash_professores ON professores;
CREATE TRIGGER trg_dash_professores
AFTER INSERT OR UPDATE OR DELETE ON professores
FOR EACH ROW EXECUTE FUNCTION trg_dashboard_metricas_incremental();

DROP TRIGGER IF EXISTS trg_dash_alunos ON alunos;
CREATE TRIGGER trg_dash_alunos
AFTER INSERT OR UPDATE OR DELETE ON alunos
FOR EACH ROW EXECUTE FUNCTION trg_dashboard_metricas_incremental();

DROP TRIGGER IF EXISTS trg_dash_turmas ON turmas;
CREATE TRIGGER trg_dash_turmas
AFTER INSERT OR UPDATE OR DELETE ON turmas
FOR EACH ROW EXECUTE FUNCTION trg_dashboard_metricas_incremental();

DROP TRIGGER IF EXISTS trg_dash_matriculas ON matriculas_em_turma;
CREATE TRIGGER trg_dash_matriculas
AFTER INSERT OR UPDATE OR DELETE ON matriculas_em_turma
FOR EACH ROW EXECUTE FUNCTION trg_dashboard_metricas_incremental();

DROP TRIGGER IF EXISTS trg_dash_provas ON provas;
CREATE TRIGGER trg_dash_provas
AFTER INSERT OR UPDATE OR DELETE ON provas
FOR EACH ROW EXECUTE FUNCTION trg_dashboard_metricas_incremental();

DROP TRIGGER IF EXISTS trg_dash_resultados ON resultados_prova;
CREATE TRIGGER trg_dash_resultados
AFTER INSERT OR UPDATE OR DELETE ON resultados_prova
FOR EACH ROW EXECUTE FUNCTION trg_dashboard_metricas_incremental();

SELECT refresh_dashboard_metricas_cache();
SELECT refresh_relatorio_academico_cache();
