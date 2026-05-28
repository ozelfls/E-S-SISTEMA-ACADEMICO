# Deploy GHFlusao

Este guia cobre o deploy em uma VM Linux usando PostgreSQL 16, backend Spring Boot e frontend Nginx.

## Arquivos

- `docker-compose.prod.yml`: sobe PostgreSQL, backend e frontend.
- `database/Dockerfile`: imagem `postgres:16-alpine`.
- `.env.deploy.example`: modelo de variaveis sem segredos reais.
- `frontend/nginx.conf`: serve o React e roteia `/api` para o backend.
- Docker/Compose moderno com BuildKit habilitado e recomendado para os caches de build.

## Primeira subida

Crie o arquivo de ambiente:

```bash
cp .env.deploy.example .env.deploy
```

Variaveis principais:

```env
POSTGRES_DB=ghflusao
POSTGRES_USER=ghflusao
POSTGRES_PASSWORD=troque_a_senha_do_postgres
POSTGRES_SCHEMA=public
POSTGRES_BIND=127.0.0.1
POSTGRES_PORT=5432
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=gere_um_valor_base64_forte
JWT_EXPIRATION=86400000
CORS_ORIGINS=http://localhost,http://127.0.0.1,https://seu-dominio.com.br
SWAGGER_ENABLED=false
BOOTSTRAP_DEMO_ADMINS=false
FRONTEND_PORT=80
BACKEND_BIND=127.0.0.1
BACKEND_PORT=8080
VITE_API_URL=/api
```

No compose de producao, `POSTGRES_JDBC_URL` e derivado de `POSTGRES_DB` como `jdbc:postgresql://database:5432/<POSTGRES_DB>` para evitar divergencia entre o banco criado e o banco usado pelo backend.

Gerar `JWT_SECRET` no PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

Subir:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.deploy up -d --build
```

Para demo em outro PC, use `SPRING_PROFILES_ACTIVE=dev,postgres-demo`. Esse modo sobe o seed demo com 30 registros e login `funnyValentine` / `1234`. Para producao limpa, mantenha `SPRING_PROFILES_ACTIVE=prod`.

Health checks:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.deploy ps
curl http://localhost/api/actuator/health/readiness
```

## Topologia

- Frontend publica `80`.
- Nginx encaminha `/api` para `backend:8080` dentro da rede Docker.
- Backend fica exposto em `${BACKEND_BIND:-127.0.0.1}:${BACKEND_PORT:-8080}` apenas para debug local na VM por padrao.
- PostgreSQL fica exposto em `${POSTGRES_BIND:-127.0.0.1}:${POSTGRES_PORT:-5432}` para manutencao local por padrao, sem exposicao publica.
- O volume persistente e `postgres-data:/var/lib/postgresql/data`.

## Backup

Antes de rebuilds que possam aplicar migrations, faca backup do PostgreSQL:

```bash
set -a
. ./.env.deploy
set +a

docker exec ghflusao-database pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --format=custom \
  --file="/tmp/ghflusao_$(date +%Y%m%d_%H%M%S).dump"
```

Copie o dump para fora do container:

```bash
docker cp ghflusao-database:/tmp/ghflusao_YYYYMMDD_HHMMSS.dump .
```

Restore:

```bash
docker cp ghflusao.dump ghflusao-database:/tmp/ghflusao.dump
docker exec ghflusao-database pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists /tmp/ghflusao.dump
```

## Atualizacao

Nao remova volumes em producao. Evite `docker compose down -v`.

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.deploy up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.deploy ps
```

## Observacoes

- `SWAGGER_ENABLED=false` por padrao em producao.
- `BOOTSTRAP_DEMO_ADMINS=false` por padrao em producao.
- O backend bloqueia boot em `prod` se `postgres-demo` ou bootstrap demo forem ativados por engano.
- O backend bloqueia boot em `prod` se `JWT_SECRET` for o placeholder do exemplo ou nao decodificar para pelo menos 32 bytes.
- O backend bloqueia boot em `prod` se `POSTGRES_PASSWORD` ainda for o placeholder do exemplo.
- `VITE_API_URL=/api` evita CORS em VM unica.
- `CORS_ORIGINS` deve apontar para o dominio real do frontend.
- Nao versionar `.env.deploy`.
- O deploy atual e PostgreSQL-only; nao ha dependencias, profiles ou migrations Oracle na aplicacao.
