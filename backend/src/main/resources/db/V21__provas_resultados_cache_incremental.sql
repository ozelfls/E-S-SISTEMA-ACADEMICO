BEGIN
    EXECUTE IMMEDIATE 'DROP TRIGGER trg_dash_resultados';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -4080 THEN
            RAISE;
        END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_provas
AFTER INSERT OR UPDATE OR DELETE ON provas
FOR EACH ROW
BEGIN
    IF DELETING THEN
        DELETE FROM relatorio_academico_cache
         WHERE prova_id = :OLD.id;
        RETURN;
    END IF;

    IF UPDATING THEN
        DELETE FROM relatorio_academico_cache
         WHERE prova_id = :OLD.id
           AND (:OLD.turma_id <> :NEW.turma_id OR :OLD.turma_id IS NULL OR :NEW.turma_id IS NULL);

        UPDATE relatorio_academico_cache
           SET prova_codigo = :NEW.codigo,
               prova_peso = :NEW.peso,
               prova_conteudo = DBMS_LOB.SUBSTR(:NEW.conteudo, 500, 1)
         WHERE prova_id = :NEW.id
           AND :OLD.turma_id = :NEW.turma_id;

        IF SQL%ROWCOUNT > 0 THEN
            RETURN;
        END IF;
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
        :NEW.id,
        :NEW.codigo,
        :NEW.peso,
        DBMS_LOB.SUBSTR(:NEW.conteudo, 500, 1),
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
      LEFT JOIN resultados_prova r ON r.matricula_id = m.id AND r.prova_id = :NEW.id
     WHERE m.turma_id = :NEW.turma_id
       AND NOT EXISTS (
           SELECT 1
             FROM relatorio_academico_cache cache
            WHERE cache.matricula_id = m.id
              AND cache.prova_id = :NEW.id
       );
END;
/

CREATE OR REPLACE TRIGGER trg_rel_acad_resultados
AFTER INSERT OR UPDATE OR DELETE ON resultados_prova
FOR EACH ROW
BEGIN
    IF DELETING OR UPDATING THEN
        UPDATE relatorio_academico_cache
           SET resultado_id = NULL,
               resultado_nota = NULL,
               resultado_presente = NULL,
               resultado_data_realizacao = NULL,
               resultado_duracao_min = NULL
         WHERE matricula_id = :OLD.matricula_id
           AND prova_id = :OLD.prova_id;

        IF DELETING THEN
            RETURN;
        END IF;
    END IF;

    MERGE INTO relatorio_academico_cache cache
    USING (
        SELECT
            a.id aluno_id,
            a.nome aluno_nome,
            a.matricula_id aluno_matricula,
            a.email aluno_email,
            a.turno aluno_turno,
            c.id curso_id,
            c.nome curso_nome,
            c.ch_total curso_ch_total,
            d.id disciplina_id,
            d.codigo disciplina_codigo,
            d.nome disciplina_nome,
            d.ch disciplina_ch,
            d.modalidade disciplina_modalidade,
            t.id turma_id,
            t.codigo turma_codigo,
            t.turno turma_turno,
            t.semestre turma_semestre,
            t.ano turma_ano,
            t.sala turma_sala,
            t.horario turma_horario,
            t.vagas turma_vagas,
            p.id professor_id,
            p.nome professor_nome,
            p.email professor_email,
            p.titulacao professor_titulacao,
            m.id matricula_id,
            m.dt_inscricao matricula_data,
            m.situacao matricula_situacao,
            m.frequencia matricula_frequencia,
            m.media_final matricula_media_final,
            pr.id prova_id,
            pr.codigo prova_codigo,
            pr.peso prova_peso,
            DBMS_LOB.SUBSTR(pr.conteudo, 500, 1) prova_conteudo,
            :NEW.id resultado_id,
            :NEW.nota resultado_nota,
            :NEW.presente resultado_presente,
            :NEW.data_realizacao resultado_data_realizacao,
            :NEW.duracao_min resultado_duracao_min
          FROM matriculas_em_turma m
          LEFT JOIN alunos a ON a.id = m.aluno_id
          LEFT JOIN turmas t ON t.id = m.turma_id
          LEFT JOIN disciplinas d ON d.id = t.disciplina_id
          LEFT JOIN cursos c ON c.id = COALESCE(d.curso_id, a.curso_id)
          LEFT JOIN professores p ON p.id = t.professor_id
          LEFT JOIN provas pr ON pr.id = :NEW.prova_id
         WHERE m.id = :NEW.matricula_id
    ) src
    ON (cache.matricula_id = src.matricula_id AND cache.prova_id = src.prova_id)
    WHEN MATCHED THEN UPDATE SET
        cache.aluno_id = src.aluno_id,
        cache.aluno_nome = src.aluno_nome,
        cache.aluno_matricula = src.aluno_matricula,
        cache.aluno_email = src.aluno_email,
        cache.aluno_turno = src.aluno_turno,
        cache.curso_id = src.curso_id,
        cache.curso_nome = src.curso_nome,
        cache.curso_ch_total = src.curso_ch_total,
        cache.disciplina_id = src.disciplina_id,
        cache.disciplina_codigo = src.disciplina_codigo,
        cache.disciplina_nome = src.disciplina_nome,
        cache.disciplina_ch = src.disciplina_ch,
        cache.disciplina_modalidade = src.disciplina_modalidade,
        cache.turma_id = src.turma_id,
        cache.turma_codigo = src.turma_codigo,
        cache.turma_turno = src.turma_turno,
        cache.turma_semestre = src.turma_semestre,
        cache.turma_ano = src.turma_ano,
        cache.turma_sala = src.turma_sala,
        cache.turma_horario = src.turma_horario,
        cache.turma_vagas = src.turma_vagas,
        cache.professor_id = src.professor_id,
        cache.professor_nome = src.professor_nome,
        cache.professor_email = src.professor_email,
        cache.professor_titulacao = src.professor_titulacao,
        cache.matricula_data = src.matricula_data,
        cache.matricula_situacao = src.matricula_situacao,
        cache.matricula_frequencia = src.matricula_frequencia,
        cache.matricula_media_final = src.matricula_media_final,
        cache.prova_codigo = src.prova_codigo,
        cache.prova_peso = src.prova_peso,
        cache.prova_conteudo = src.prova_conteudo,
        cache.resultado_id = src.resultado_id,
        cache.resultado_nota = src.resultado_nota,
        cache.resultado_presente = src.resultado_presente,
        cache.resultado_data_realizacao = src.resultado_data_realizacao,
        cache.resultado_duracao_min = src.resultado_duracao_min
    WHEN NOT MATCHED THEN INSERT (
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
    ) VALUES (
        src.aluno_id,
        src.aluno_nome,
        src.aluno_matricula,
        src.aluno_email,
        src.aluno_turno,
        src.curso_id,
        src.curso_nome,
        src.curso_ch_total,
        src.disciplina_id,
        src.disciplina_codigo,
        src.disciplina_nome,
        src.disciplina_ch,
        src.disciplina_modalidade,
        src.turma_id,
        src.turma_codigo,
        src.turma_turno,
        src.turma_semestre,
        src.turma_ano,
        src.turma_sala,
        src.turma_horario,
        src.turma_vagas,
        src.professor_id,
        src.professor_nome,
        src.professor_email,
        src.professor_titulacao,
        src.matricula_id,
        src.matricula_data,
        src.matricula_situacao,
        src.matricula_frequencia,
        src.matricula_media_final,
        src.prova_id,
        src.prova_codigo,
        src.prova_peso,
        src.prova_conteudo,
        src.resultado_id,
        src.resultado_nota,
        src.resultado_presente,
        src.resultado_data_realizacao,
        src.resultado_duracao_min
    );
END;
/
