BEGIN
    EXECUTE IMMEDIATE '
        CREATE TABLE relatorio_academico_cache (
            cache_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            aluno_id NUMBER,
            aluno_nome VARCHAR2(180),
            aluno_matricula NUMBER,
            aluno_email VARCHAR2(180),
            aluno_turno VARCHAR2(20),
            curso_id NUMBER,
            curso_nome VARCHAR2(180),
            curso_ch_total NUMBER,
            disciplina_id NUMBER,
            disciplina_codigo VARCHAR2(40),
            disciplina_nome VARCHAR2(180),
            disciplina_ch NUMBER,
            disciplina_modalidade VARCHAR2(20),
            turma_id NUMBER,
            turma_codigo VARCHAR2(40),
            turma_turno VARCHAR2(20),
            turma_semestre VARCHAR2(20),
            turma_ano NUMBER,
            turma_sala VARCHAR2(80),
            turma_horario VARCHAR2(180),
            turma_vagas NUMBER,
            professor_id NUMBER,
            professor_nome VARCHAR2(180),
            professor_email VARCHAR2(180),
            professor_titulacao VARCHAR2(120),
            matricula_id NUMBER,
            matricula_data DATE,
            matricula_situacao VARCHAR2(20),
            matricula_frequencia NUMBER,
            matricula_media_final NUMBER,
            prova_id NUMBER,
            prova_codigo VARCHAR2(40),
            prova_peso NUMBER,
            prova_conteudo VARCHAR2(500),
            resultado_id NUMBER,
            resultado_nota NUMBER,
            resultado_presente NUMBER(1),
            resultado_data_realizacao DATE,
            resultado_duracao_min NUMBER
        )';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

CREATE OR REPLACE PROCEDURE refresh_relatorio_academico_cache AS
BEGIN
    DELETE FROM relatorio_academico_cache;

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
        pr.conteudo,
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
    LEFT JOIN resultados_prova r ON r.matricula_id = m.id AND r.prova_id = pr.id;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_rel_acad_aluno ON relatorio_academico_cache (aluno_id)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_rel_acad_turma ON relatorio_academico_cache (turma_id)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_rel_acad_matricula ON relatorio_academico_cache (matricula_id)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_rel_acad_prova ON relatorio_academico_cache (prova_id)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_alunos
AFTER INSERT OR UPDATE OR DELETE ON alunos
BEGIN
    refresh_relatorio_academico_cache;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_cursos
AFTER INSERT OR UPDATE OR DELETE ON cursos
BEGIN
    refresh_relatorio_academico_cache;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_disciplinas
AFTER INSERT OR UPDATE OR DELETE ON disciplinas
BEGIN
    refresh_relatorio_academico_cache;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_turmas
AFTER INSERT OR UPDATE OR DELETE ON turmas
BEGIN
    refresh_relatorio_academico_cache;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_professores
AFTER INSERT OR UPDATE OR DELETE ON professores
BEGIN
    refresh_relatorio_academico_cache;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_matriculas
AFTER INSERT OR UPDATE OR DELETE ON matriculas_em_turma
BEGIN
    refresh_relatorio_academico_cache;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_provas
AFTER INSERT OR UPDATE OR DELETE ON provas
BEGIN
    refresh_relatorio_academico_cache;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_resultados
AFTER INSERT OR UPDATE OR DELETE ON resultados_prova
BEGIN
    refresh_relatorio_academico_cache;
END;
/

BEGIN
    refresh_relatorio_academico_cache;
END;
/
