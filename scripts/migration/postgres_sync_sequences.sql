SELECT setval(pg_get_serial_sequence('professores', 'id'), COALESCE((SELECT max(id) FROM professores), 1), EXISTS(SELECT 1 FROM professores));
SELECT setval(pg_get_serial_sequence('cursos', 'id'), COALESCE((SELECT max(id) FROM cursos), 1), EXISTS(SELECT 1 FROM cursos));
SELECT setval(pg_get_serial_sequence('alunos', 'id'), COALESCE((SELECT max(id) FROM alunos), 1), EXISTS(SELECT 1 FROM alunos));
SELECT setval(pg_get_serial_sequence('disciplinas', 'id'), COALESCE((SELECT max(id) FROM disciplinas), 1), EXISTS(SELECT 1 FROM disciplinas));
SELECT setval(pg_get_serial_sequence('turmas', 'id'), COALESCE((SELECT max(id) FROM turmas), 1), EXISTS(SELECT 1 FROM turmas));
SELECT setval(pg_get_serial_sequence('matriculas_em_turma', 'id'), COALESCE((SELECT max(id) FROM matriculas_em_turma), 1), EXISTS(SELECT 1 FROM matriculas_em_turma));
SELECT setval(pg_get_serial_sequence('provas', 'id'), COALESCE((SELECT max(id) FROM provas), 1), EXISTS(SELECT 1 FROM provas));
SELECT setval(pg_get_serial_sequence('resultados_prova', 'id'), COALESCE((SELECT max(id) FROM resultados_prova), 1), EXISTS(SELECT 1 FROM resultados_prova));
SELECT setval(pg_get_serial_sequence('usuarios_sistema', 'id'), COALESCE((SELECT max(id) FROM usuarios_sistema), 1), EXISTS(SELECT 1 FROM usuarios_sistema));

SELECT setval(
    'seq_aluno_matricula',
    COALESCE((SELECT max(matricula_id) FROM alunos WHERE matricula_id BETWEEN 100000 AND 999999), 100000),
    EXISTS(SELECT 1 FROM alunos WHERE matricula_id BETWEEN 100000 AND 999999)
);
