CREATE TEMP TABLE migration_validation_failures (
    check_name text PRIMARY KEY,
    failures bigint NOT NULL
);

WITH row_counts(table_name, rows_found) AS (
    SELECT 'professores', count(*) FROM professores
    UNION ALL SELECT 'cursos', count(*) FROM cursos
    UNION ALL SELECT 'alunos', count(*) FROM alunos
    UNION ALL SELECT 'disciplinas', count(*) FROM disciplinas
    UNION ALL SELECT 'turmas', count(*) FROM turmas
    UNION ALL SELECT 'matriculas_em_turma', count(*) FROM matriculas_em_turma
    UNION ALL SELECT 'provas', count(*) FROM provas
    UNION ALL SELECT 'resultados_prova', count(*) FROM resultados_prova
    UNION ALL SELECT 'usuarios_sistema', count(*) FROM usuarios_sistema
    UNION ALL SELECT 'dashboard_metricas', count(*) FROM dashboard_metricas
    UNION ALL SELECT 'relatorio_academico_cache', count(*) FROM relatorio_academico_cache
    UNION ALL SELECT 'auditoria_resultados', count(*) FROM auditoria_resultados
)
SELECT *
FROM row_counts
ORDER BY table_name;

INSERT INTO migration_validation_failures(check_name, failures)
SELECT 'alunos_sem_curso', count(*)
FROM alunos a
LEFT JOIN cursos c ON c.id = a.curso_id
WHERE a.curso_id IS NOT NULL AND c.id IS NULL
UNION ALL
SELECT 'cursos_sem_coordenador_valido', count(*)
FROM cursos c
LEFT JOIN professores p ON p.id = c.coordenador_id
WHERE c.coordenador_id IS NOT NULL AND p.id IS NULL
UNION ALL
SELECT 'disciplinas_sem_curso', count(*)
FROM disciplinas d
LEFT JOIN cursos c ON c.id = d.curso_id
WHERE c.id IS NULL
UNION ALL
SELECT 'disciplinas_pre_requisito_invalido', count(*)
FROM disciplinas d
LEFT JOIN disciplinas pr ON pr.id = d.pre_requisito_id
WHERE d.pre_requisito_id IS NOT NULL AND pr.id IS NULL
UNION ALL
SELECT 'turmas_professor_invalido', count(*)
FROM turmas t
LEFT JOIN professores p ON p.id = t.professor_id
WHERE t.professor_id IS NOT NULL AND p.id IS NULL
UNION ALL
SELECT 'turmas_disciplina_invalida', count(*)
FROM turmas t
LEFT JOIN disciplinas d ON d.id = t.disciplina_id
WHERE t.disciplina_id IS NOT NULL AND d.id IS NULL
UNION ALL
SELECT 'matriculas_aluno_invalido', count(*)
FROM matriculas_em_turma m
LEFT JOIN alunos a ON a.id = m.aluno_id
WHERE a.id IS NULL
UNION ALL
SELECT 'matriculas_turma_invalida', count(*)
FROM matriculas_em_turma m
LEFT JOIN turmas t ON t.id = m.turma_id
WHERE t.id IS NULL
UNION ALL
SELECT 'provas_turma_invalida', count(*)
FROM provas p
LEFT JOIN turmas t ON t.id = p.turma_id
WHERE t.id IS NULL
UNION ALL
SELECT 'resultados_matricula_invalida', count(*)
FROM resultados_prova r
LEFT JOIN matriculas_em_turma m ON m.id = r.matricula_id
WHERE m.id IS NULL
UNION ALL
SELECT 'resultados_prova_invalida', count(*)
FROM resultados_prova r
LEFT JOIN provas p ON p.id = r.prova_id
WHERE p.id IS NULL;

INSERT INTO migration_validation_failures(check_name, failures)
SELECT 'cpf_professor_duplicado', count(*)
FROM (
    SELECT cpf FROM professores WHERE cpf IS NOT NULL GROUP BY cpf HAVING count(*) > 1
) duplicates
UNION ALL
SELECT 'cpf_aluno_duplicado', count(*)
FROM (
    SELECT cpf FROM alunos WHERE cpf IS NOT NULL GROUP BY cpf HAVING count(*) > 1
) duplicates
UNION ALL
SELECT 'registro_professor_duplicado', count(*)
FROM (
    SELECT registro FROM professores WHERE registro IS NOT NULL GROUP BY registro HAVING count(*) > 1
) duplicates
UNION ALL
SELECT 'codigo_disciplina_duplicado', count(*)
FROM (
    SELECT codigo FROM disciplinas GROUP BY codigo HAVING count(*) > 1
) duplicates
UNION ALL
SELECT 'codigo_turma_duplicado', count(*)
FROM (
    SELECT codigo FROM turmas GROUP BY codigo HAVING count(*) > 1
) duplicates
UNION ALL
SELECT 'codigo_prova_duplicado', count(*)
FROM (
    SELECT codigo FROM provas GROUP BY codigo HAVING count(*) > 1
) duplicates
UNION ALL
SELECT 'login_duplicado', count(*)
FROM (
    SELECT login FROM usuarios_sistema GROUP BY login HAVING count(*) > 1
) duplicates;

INSERT INTO migration_validation_failures(check_name, failures)
SELECT 'disciplina_ativo_fora_0_1', count(*)
FROM disciplinas
WHERE ativo NOT IN (0, 1)
UNION ALL
SELECT 'turma_ativo_fora_0_1', count(*)
FROM turmas
WHERE ativo NOT IN (0, 1)
UNION ALL
SELECT 'resultado_presente_fora_0_1', count(*)
FROM resultados_prova
WHERE presente IS NOT NULL AND presente NOT IN (0, 1)
UNION ALL
SELECT 'matricula_fora_6_digitos', count(*)
FROM alunos
WHERE matricula_id NOT BETWEEN 100000 AND 999999
UNION ALL
SELECT 'nota_fora_intervalo', count(*)
FROM resultados_prova
WHERE nota IS NOT NULL AND (nota < 0 OR nota > 10)
UNION ALL
SELECT 'frequencia_fora_intervalo', count(*)
FROM matriculas_em_turma
WHERE frequencia < 0 OR frequencia > 100
UNION ALL
SELECT 'media_final_fora_intervalo', count(*)
FROM matriculas_em_turma
WHERE media_final IS NOT NULL AND (media_final < 0 OR media_final > 10)
UNION ALL
SELECT 'curso_ch_total_invalido', count(*)
FROM cursos
WHERE ch_total <= 0
UNION ALL
SELECT 'curso_prazos_invalidos', count(*)
FROM cursos
WHERE prev_termino_anos <= 0 OR limite_conclusao < prev_termino_anos
UNION ALL
SELECT 'disciplina_creditos_invalidos', count(*)
FROM disciplinas
WHERE creditos <= 0
UNION ALL
SELECT 'disciplina_ch_invalida', count(*)
FROM disciplinas
WHERE ch <= 0
UNION ALL
SELECT 'turma_ano_invalido', count(*)
FROM turmas
WHERE ano NOT BETWEEN 2000 AND 2100
UNION ALL
SELECT 'turma_vagas_invalidas', count(*)
FROM turmas
WHERE vagas < 0
UNION ALL
SELECT 'prova_peso_invalido', count(*)
FROM provas
WHERE peso <= 0 OR peso > 10
UNION ALL
SELECT 'aluno_turno_invalido', count(*)
FROM alunos
WHERE turno IS NOT NULL AND turno NOT IN ('MANHA', 'TARDE', 'NOITE', 'INTEGRAL')
UNION ALL
SELECT 'disciplina_modalidade_invalida', count(*)
FROM disciplinas
WHERE modalidade IS NOT NULL AND modalidade NOT IN ('PRESENCIAL', 'EAD', 'HIBRIDA')
UNION ALL
SELECT 'turma_turno_invalido', count(*)
FROM turmas
WHERE turno IS NOT NULL AND turno NOT IN ('MANHA', 'TARDE', 'NOITE', 'INTEGRAL')
UNION ALL
SELECT 'turma_status_invalido', count(*)
FROM turmas
WHERE status NOT IN ('OPEN', 'IN_PROGRESS', 'CLOSED')
UNION ALL
SELECT 'matricula_situacao_invalida', count(*)
FROM matriculas_em_turma
WHERE situacao NOT IN ('ATIVA', 'TRANCADA', 'CONCLUIDA', 'REPROVADA')
UNION ALL
SELECT 'usuario_perfil_invalido', count(*)
FROM usuarios_sistema
WHERE perfil NOT IN ('SECRETARIA', 'DIRETOR', 'COORDENADOR', 'PROFESSOR', 'ALUNO', 'ADMIN');

INSERT INTO migration_validation_failures(check_name, failures)
SELECT 'dashboard_metricas_total_cursos', count(*)
FROM dashboard_metricas dm
WHERE dm.id = 1 AND dm.total_cursos <> (SELECT count(*) FROM cursos)
UNION ALL
SELECT 'dashboard_metricas_total_disciplinas', count(*)
FROM dashboard_metricas dm
WHERE dm.id = 1 AND dm.total_disciplinas <> (SELECT count(*) FROM disciplinas WHERE COALESCE(ativo, 1) = 1)
UNION ALL
SELECT 'dashboard_metricas_total_professores', count(*)
FROM dashboard_metricas dm
WHERE dm.id = 1 AND dm.total_professores <> (SELECT count(*) FROM professores)
UNION ALL
SELECT 'dashboard_metricas_total_alunos', count(*)
FROM dashboard_metricas dm
WHERE dm.id = 1 AND dm.total_alunos <> (SELECT count(*) FROM alunos)
UNION ALL
SELECT 'dashboard_metricas_total_turmas', count(*)
FROM dashboard_metricas dm
WHERE dm.id = 1 AND dm.total_turmas <> (SELECT count(*) FROM turmas WHERE COALESCE(ativo, 1) = 1)
UNION ALL
SELECT 'dashboard_metricas_total_matriculas', count(*)
FROM dashboard_metricas dm
WHERE dm.id = 1 AND dm.total_matriculas <> (SELECT count(*) FROM matriculas_em_turma)
UNION ALL
SELECT 'dashboard_metricas_total_provas', count(*)
FROM dashboard_metricas dm
WHERE dm.id = 1 AND dm.total_provas <> (SELECT count(*) FROM provas)
UNION ALL
SELECT 'dashboard_metricas_total_resultados', count(*)
FROM dashboard_metricas dm
WHERE dm.id = 1 AND dm.total_resultados <> (SELECT count(*) FROM resultados_prova)
UNION ALL
SELECT 'dashboard_metricas_linha_unica', abs((SELECT count(*) FROM dashboard_metricas) - 1)
UNION ALL
SELECT 'dashboard_metricas_id_invalido', count(*)
FROM dashboard_metricas
WHERE id <> 1;

WITH expected_relatorio AS (
    SELECT
        a.id AS aluno_id,
        a.nome AS aluno_nome,
        a.matricula_id AS aluno_matricula,
        a.email AS aluno_email,
        a.turno AS aluno_turno,
        c.id AS curso_id,
        c.nome AS curso_nome,
        c.ch_total AS curso_ch_total,
        d.id AS disciplina_id,
        d.codigo AS disciplina_codigo,
        d.nome AS disciplina_nome,
        d.ch AS disciplina_ch,
        d.modalidade AS disciplina_modalidade,
        t.id AS turma_id,
        t.codigo AS turma_codigo,
        t.turno AS turma_turno,
        t.semestre AS turma_semestre,
        t.ano AS turma_ano,
        t.sala AS turma_sala,
        t.horario AS turma_horario,
        t.vagas AS turma_vagas,
        p.id AS professor_id,
        p.nome AS professor_nome,
        p.email AS professor_email,
        p.titulacao AS professor_titulacao,
        m.id AS matricula_id,
        m.dt_inscricao AS matricula_data,
        m.situacao AS matricula_situacao,
        m.frequencia AS matricula_frequencia,
        m.media_final AS matricula_media_final,
        pr.id AS prova_id,
        pr.codigo AS prova_codigo,
        pr.peso AS prova_peso,
        substring(pr.conteudo from 1 for 500) AS prova_conteudo,
        r.id AS resultado_id,
        r.nota AS resultado_nota,
        r.presente AS resultado_presente,
        r.data_realizacao AS resultado_data_realizacao,
        r.duracao_min AS resultado_duracao_min
    FROM matriculas_em_turma m
    LEFT JOIN alunos a ON a.id = m.aluno_id
    LEFT JOIN turmas t ON t.id = m.turma_id
    LEFT JOIN disciplinas d ON d.id = t.disciplina_id
    LEFT JOIN cursos c ON c.id = COALESCE(d.curso_id, a.curso_id)
    LEFT JOIN professores p ON p.id = t.professor_id
    LEFT JOIN provas pr ON pr.turma_id = t.id
    LEFT JOIN resultados_prova r ON r.matricula_id = m.id AND r.prova_id = pr.id
),
missing_rows AS (
    SELECT * FROM expected_relatorio
    EXCEPT
    SELECT
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
    FROM relatorio_academico_cache
),
extra_rows AS (
    SELECT
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
    FROM relatorio_academico_cache
    EXCEPT
    SELECT * FROM expected_relatorio
)
INSERT INTO migration_validation_failures(check_name, failures)
SELECT 'relatorio_cache_count_mismatch',
       abs((SELECT count(*) FROM relatorio_academico_cache) - (SELECT count(*) FROM expected_relatorio))
UNION ALL
SELECT 'relatorio_cache_linhas_faltando', count(*) FROM missing_rows
UNION ALL
SELECT 'relatorio_cache_linhas_extras', count(*) FROM extra_rows;

SELECT check_name, failures
FROM migration_validation_failures
ORDER BY check_name;

DO $$
DECLARE
    total_failures bigint;
BEGIN
    SELECT COALESCE(sum(failures), 0)
    INTO total_failures
    FROM migration_validation_failures;

    IF total_failures > 0 THEN
        RAISE EXCEPTION 'Validacao de migracao falhou com % inconsistencias. Veja migration_validation_failures acima.', total_failures;
    END IF;
END;
$$;
