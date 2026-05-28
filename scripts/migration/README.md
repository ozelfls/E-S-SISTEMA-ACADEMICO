# Importacao de dados reais para PostgreSQL

Este diretorio guarda a trilha operacional para migrar dados reais para o schema PostgreSQL ja criado pelo Flyway.

## Ordem segura

1. Subir PostgreSQL vazio e aplicar Flyway sem `postgres-demo`.
2. Desligar backend durante a carga.
3. Importar tabelas de base na ordem abaixo.
4. Rodar `postgres_sync_sequences.sql`.
5. Rodar `postgres_refresh_caches.sql`.
6. Rodar `postgres_import_validation.sql`.
7. Subir backend com `SPRING_PROFILES_ACTIVE=prod` ou ambiente equivalente.

## Ordem de carga

```text
professores
cursos
alunos
disciplinas sem pre_requisito_id
disciplinas update pre_requisito_id
turmas
matriculas_em_turma
provas
resultados_prova
usuarios_sistema
```

## Formato recomendado

Use CSV UTF-8 com header e `\copy` pelo `psql`, ou uma ferramenta ETL que respeite a ordem de carga. Para carga massiva, prefira importar para tabelas staging, normalizar CPF/enum/flags, depois inserir nas tabelas finais.

Colunas finais por tabela:

- `professores`: `id,nome,cpf,endereco,dt_nascimento,telefone,email,registro,titulacao,regime_trabalho`
- `cursos`: `id,nome,ch_total,prev_termino_anos,limite_conclusao,coordenador_id`
- `alunos`: `id,nome,cpf,endereco,dt_nascimento,telefone,email,matricula_id,turno,nec_especial,curso_id`
- `disciplinas`: `id,codigo,nome,creditos,ch,ementa,modalidade,curso_id,ativo,pre_requisito_id`
- `turmas`: `id,codigo,horario,vagas,carga_horaria,semestre,ano,turno,sala,status,ativo,professor_id,disciplina_id`
- `matriculas_em_turma`: `id,aluno_id,turma_id,dt_inscricao,situacao,frequencia,media_final,observacao`
- `provas`: `id,codigo,peso,conteudo,turma_id`
- `resultados_prova`: `id,matricula_id,prova_id,nota,presente,data_realizacao,duracao_min`
- `usuarios_sistema`: `id,login,senha_hash,perfil,pessoa_id,ativo`

Transformacoes obrigatorias:

- Datas em `YYYY-MM-DD`.
- CPF no formato aceito pela aplicacao, preferencialmente mascarado.
- `disciplinas.ativo`, `turmas.ativo` e `resultados_prova.presente`: `0`, `1` ou `NULL` quando permitido.
- `usuarios_sistema.ativo`: `true` ou `false`.
- Enums em caixa alta: `MANHA`, `TARDE`, `NOITE`, `INTEGRAL`, `PRESENCIAL`, `EAD`, `HIBRIDA`, `OPEN`, `IN_PROGRESS`, `CLOSED`, `ATIVA`, `TRANCADA`, `CONCLUIDA`, `REPROVADA`.
- IDs preservados para manter relacionamentos; depois rode `postgres_sync_sequences.sql`.

Exemplo:

```powershell
docker cp .\exports\professores.csv ghflusao_oracle:/tmp/professores.csv
docker exec -it ghflusao_oracle psql -U ghflusao -d ghflusao -c "\copy professores from '/tmp/professores.csv' with (format csv, header true)"
```

## Regras preservadas

- IDs podem ser preservados para manter relacionamentos.
- `matricula_id` deve ficar entre `100000` e `999999`.
- Flags numericas usam `smallint` com `0/1`.
- `usuarios_sistema.ativo` usa `boolean`.
- Depois de importar, sequences precisam ser sincronizadas antes de liberar escrita pelo backend.
- `postgres_import_validation.sql` aborta com erro se qualquer validacao retornar falha.
