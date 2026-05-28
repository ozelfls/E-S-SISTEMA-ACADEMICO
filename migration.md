# Migracao absoluta para PostgreSQL

Data: 2026-05-25

## Decisao atual

O GHFlusao passa a ser PostgreSQL-only. A trilha operacional Oracle foi removida do build, da configuracao Spring, das migrations e do deploy. O container local pode continuar chamado `ghflusao_oracle` por disfarce, mas roda PostgreSQL 16.

## Estado aplicado

- Banco alvo: PostgreSQL 16.
- Container local: `ghflusao_oracle`, porta `5432`, database/user `ghflusao`.
- Datasource default: `jdbc:postgresql://localhost:5432/ghflusao`.
- Flyway default: `classpath:db/postgres`.
- Seed de laboratorio: `classpath:db/postgres-demo`, ativado por `SPRING_PROFILES_ACTIVE=dev,postgres-demo` ou `postgres-demo`.
- Producao: `SPRING_PROFILES_ACTIVE=prod`.
- Swagger: desligado por default; laboratorio deve ativar `SWAGGER_ENABLED=true` quando precisar.
- Admin demo: controlado por `BOOTSTRAP_DEMO_ADMINS`, desligado por default.
- Trava de seguranca: em `prod`, o backend falha se `postgres-demo`, `BOOTSTRAP_DEMO_ADMINS=true`, `JWT_SECRET` fraco/placeholder ou `POSTGRES_PASSWORD` placeholder forem usados.

## Blocos de execucao

### 1. Remocao Oracle operacional

Status: concluido.

- Removidas dependencias `ojdbc11`, `ucp` e `flyway-database-oracle`.
- Removidos driver/dialect Oracle do `application.yml`.
- Removida pasta `backend/src/main/resources/db/oracle`.
- Removido fallback SQL `select ... from dual`.
- Variaveis de deploy agora usam `POSTGRES_*`.
- Compose, Render e CI usam PostgreSQL como caminho unico.

QA:

- `mvn test`: 7 testes, 0 falhas.
- Busca operacional sem residuos de Oracle em backend/config/migrations, exceto mencoes historicas/documentais controladas.

### 2. Mapeamentos JPA e SQL PostgreSQL

Status: concluido.

- Flags numericas seguem em `smallint` com `BooleanToNumberConverter`.
- Removidos `columnDefinition = "NUMBER(1)"` das entidades.
- Campos longos usam `text`.
- Sequencia de matricula usa `nextval('seq_aluno_matricula')`.
- `BooleanToNumberConverter` usa `Short` e preserva `null` para campos opcionais.

QA:

- Compilacao Java.
- `mvn test`: 12 testes, 0 falhas na validacao do bloco.
- Flyway em schema limpo.
- Health local 200.

### 3. Importacao de dados reais

Status: concluido como trilha local.

Sem credenciais/dump do banco real nesta maquina, a etapa executavel aqui foi preparar scripts de importacao, validacao, contagem, sincronizacao de sequences e checklist. A carga real depende do arquivo exportado ou acesso ao banco de origem.

Artefatos:

- `scripts/migration/README.md`
- `scripts/migration/postgres_sync_sequences.sql`
- `scripts/migration/postgres_refresh_caches.sql`
- `scripts/migration/postgres_import_validation.sql`

QA:

- Scripts executados no PostgreSQL demo.
- Validacao aborta com erro se houver falhas.
- `postgres_import_validation.sql`: 51 checks, 0 falhas.

### 4. Hardening de producao

Status: concluido.

- Producao sem seed demo.
- Swagger desligado por default.
- Secrets por ambiente.
- Backup/restore PostgreSQL documentado.
- `ProductionSafetyGuard` bloqueia `postgres-demo`, admin demo, JWT fraco/placeholder e senha PostgreSQL placeholder em `prod`.
- `/actuator/health/**` liberado para healthchecks sem abrir endpoints de negocio.

QA:

- `mvn test`: 13 testes, 0 falhas.
- Readiness sem token: 200.

### 5. Triggers, caches e indices

Status: concluido em laboratorio.

- Triggers de dashboard, relatorio, resultados e matriculas convertidos para PostgreSQL.
- Caches mantidos no banco.
- Indices compostos/parciais adicionados em `V14__performance_indexes.sql` para dashboard, relatorio, matriculas, provas e auditoria.
- Scripts de validacao conferem caches contra os dados fonte.

### 6. Deploy Docker

Status: concluido.

- `database/Dockerfile` usa `postgres:16-alpine`.
- `docker-compose.prod.yml` sobe PostgreSQL, backend e frontend.
- Backend aponta para `jdbc:postgresql://database:5432/${POSTGRES_DB}` derivado pelo compose.
- Healthcheck do backend usa `/api/actuator/health/readiness` e foi validado com 200.
- `POSTGRES_PASSWORD` placeholder e bloqueado em `prod`.
- Dockerfiles de backend/frontend/database foram atualizados para BuildKit syntax 1.7, cache de dependencias e healthchecks com periodo de aquecimento.

QA:

- `docker compose ... config`: passou.
- `docker build` database/backend/frontend: passou.
- `npm run build`: passou com warning de chunk grande do Vite.
- Rodada de 2026-05-25: `docker build` database/backend/frontend passou com as imagens `ghflusao-*:postgres-test`.
- Rodada de 2026-05-25: `docker compose --env-file .env.deploy.example -f docker-compose.prod.yml config` passou; Docker local ainda avisa `Acesso negado` em `C:\Users\SilvaD\.docker\config.json`, sem bloquear a renderizacao.
- Rodada de 2026-05-25: `mvn test` passou com Java 21; o Maven sem `JAVA_HOME` explicito continua apontando para Java 17 nesta maquina.

### 7. QA final e seed 10x

Status: concluido.

- Recriar schema limpo.
- Rodar Flyway com seed demo ate V14.
- Confirmar 10 registros nas tabelas principais.
- Validar login, dashboard, relatorio, prova e build frontend.

QA final em 2026-05-25:

- Flyway: V1, V2 demo, V3, V10, V11, V12, V13, V14 aplicadas com sucesso.
- Tabelas principais: 10 registros cada em professores, cursos, disciplinas, alunos, turmas, matriculas, provas, resultados e usuarios.
- `postgres_import_validation.sql`: 51 checks, 0 falhas.
- Rodada de 2026-05-25 no container `ghflusao_oracle`: `postgres_import_validation.sql` passou novamente com 51 checks, 0 falhas.
- Login `funnyValentine` / `1234`: sucesso.
- `GET /api/actuator/health`: 200.
- `GET /api/actuator/health/readiness`: 200.
- `GET /api/dashboard/admin-resumo`: 200.
- `GET /api/consultas/relatorio-academico`: 200.
- `GET /api/provas/879001/lancamento`: 200.
- `mvn test`: 13 testes, 0 falhas.
- `npm run build`: sucesso, com warning de chunk grande do Vite.

## Comandos principais

Banco local:

```powershell
docker exec ghflusao_oracle pg_isready -U ghflusao -d ghflusao
```

Backend demo:

```powershell
$env:SPRING_PROFILES_ACTIVE='dev,postgres-demo'
$env:POSTGRES_JDBC_URL='jdbc:postgresql://localhost:5432/ghflusao'
$env:POSTGRES_USER='ghflusao'
$env:POSTGRES_PASSWORD='ghflusao123'
$env:POSTGRES_SCHEMA='public'
$env:BOOTSTRAP_DEMO_ADMINS='true'
$env:PORT='8081'
mvn spring-boot:run
```

Producao:

```env
SPRING_PROFILES_ACTIVE=prod
POSTGRES_JDBC_URL=jdbc:postgresql://database:5432/ghflusao
SWAGGER_ENABLED=false
BOOTSTRAP_DEMO_ADMINS=false
```

## Riscos restantes

- A migracao de dados reais ainda depende do dump/export/acesso da origem.
- Triggers incrementais precisam ser validados com carga real.
- Caches devem ser recontados depois de qualquer importacao massiva.
- Secrets reais nao devem entrar no git.

## QA funcional orientado pelo frontend - 2026-05-26

Status: concluido.

- Rotas e chamadas de `frontend/src/api` foram cruzadas com os controllers Spring.
- Smokes por perfil passaram com 200 nos caminhos base usados pelas telas:
  - ADMIN: dashboard, cursos, professores, alunos, disciplinas, turmas, matriculas, provas e relatorio academico.
  - SECRETARIA: alunos e cursos.
  - DIRETOR: cursos, disciplinas e professores.
  - COORDENADOR: disciplinas, turmas e professores.
  - PROFESSOR: turmas e lancamento de prova.
  - ALUNO: turmas, turmas ativas, historico e opcoes de matricula.
- CRUD temporario via API validou criacao/edicao de professor, curso, disciplina, turma e aluno.
- Achado corrigido: exclusao de curso/professor com vinculos historicos inativos podia chegar em falha obscura de FK. Agora bloqueia com `BusinessException` 422 antes da tentativa de delete fisico.
- Teste automatizado adicionado: `DeletionGuardTest`.
- Paleta da pizza da dashboard foi trocada para tons institucionais mais suaves e menos saturados.
- Validacoes finais:
  - `mvn test`: 16 testes, 0 falhas.
  - `npm.cmd run build`: sucesso, com warning conhecido de chunk grande do Vite.
  - `postgres_import_validation.sql`: 51 checks, 0 falhas.
  - Backend local `http://localhost:8081/api/actuator/health/readiness`: 200.
  - Frontend local `http://localhost:5173`: 200.

## Expansao do seed para Master Details - 2026-05-27

Status: concluido.

Objetivo:

- Aumentar a massa demo para que Master Details, dashboard e relatorio academico tenham dados suficientes para paginacao, busca e analises melhores.
- O Master Details pagina masters em 25 itens; com 30 registros por tabela principal, o fluxo passa a exercitar segunda pagina e listas maiores.

Artefato:

- `backend/src/main/resources/db/postgres-demo/V15__seed_master_details_expandido.sql`

Resultado no banco `ghflusao_oracle`:

- professores: 30
- cursos: 30
- disciplinas: 30
- alunos: 30
- turmas: 30
- matriculas_em_turma: 30
- provas: 30
- resultados_prova: 30
- usuarios_sistema: 30
- relatorio_academico_cache: 30

Caracteristicas da carga:

- 20 registros novos relacionados em cada tabela principal.
- Novos cursos, disciplinas, professores, alunos, turmas, matriculas, provas, resultados e usuarios.
- Mix de turnos, status de turma, situacoes de matricula, frequencias, medias baixas, reprovacoes, trancamentos e notas pendentes.
- Logins de alunos novos: `100011` ate `100030`, senha `1234`.
- Caches de dashboard e relatorio sao atualizados no fim da migration.
- Sequences sao sincronizadas ate `30`; `seq_aluno_matricula` fica em `100030`.

QA:

- `mvn.cmd -DskipTests package`: passou.
- Flyway aplicou `V15 - seed master details expandido` com sucesso.
- `postgres_import_validation.sql`: 51 checks, 0 falhas.
- Endpoints base do Master Details retornaram 200 com admin:
  - `/api/cursos`
  - `/api/professores`
  - `/api/alunos`
  - `/api/disciplinas`
  - `/api/turmas`
  - `/api/consultas/relatorio-academico`
  - `/api/dashboard/admin-resumo`

## QA final parcial - 2026-05-27

Status: concluido para os blocos 1, 2 e 3 pedidos.

QA visual/funcional:

- O projeto nao possui Playwright/Cypress configurado.
- Foi feita validacao funcional automatizada dos dados reais usados pela dashboard.
- Dashboard confirmou `totalAlunos = 30`.
- Backend retorna os 8 maiores cursos em `alunosPorCurso`; soma dos itens retornados = 8.
- Frontend calcula a fatia `Outros = 22` para fechar o donut e evitar area branca no grafico.
- Frontend local respondeu 200 em `http://localhost:5173`.

Bateria tecnica:

- `mvn.cmd test` com JDK 21: 16 testes, 0 falhas.
- `npm.cmd run build`: passou, com warning conhecido de chunk grande do Vite.
- `postgres_import_validation.sql`: 51 checks, 0 falhas.

Smokes HTTP:

- `/api/dashboard/admin-resumo`: 200
- `/api/consultas/relatorio-academico`: 200
- `/api/cursos`: 200
- `/api/professores`: 200
- `/api/alunos`: 200
- `/api/disciplinas`: 200
- `/api/turmas`: 200
- `/api/provas/879001/lancamento`: 200
- `/api/actuator/health/readiness`: 200
- `http://localhost:5173`: 200

Documentacao:

- `context.md` foi reescrito para o estado atual PostgreSQL-only, removendo o excesso de historico Oracle e consolidando comandos, validacoes, seed demo e pendencias restantes.
